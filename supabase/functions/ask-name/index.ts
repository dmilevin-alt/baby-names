import Anthropic from "npm:@anthropic-ai/sdk@0.131.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });

// What Claude must return. Every field is always present; empty when it doesn't apply.
const INSIGHTS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["origin", "namesakes", "siblingFit", "fullName", "considerations", "answer"],
  properties: {
    origin: { type: "string" },
    namesakes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "knownFor"],
        properties: { name: { type: "string" }, knownFor: { type: "string" } },
      },
    },
    siblingFit: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sibling", "fit"],
        properties: { sibling: { type: "string" }, fit: { type: "string" } },
      },
    },
    fullName: {
      type: "object",
      additionalProperties: false,
      required: ["examples", "notes"],
      properties: {
        examples: { type: "array", items: { type: "string" } },
        notes: { type: "string" },
      },
    },
    considerations: { type: "array", items: { type: "string" } },
    answer: { type: "string" },
  },
};

const clean = (value: unknown, max = 80) =>
  String(value ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

const cleanList = (value: unknown, maxItems = 10) =>
  (Array.isArray(value) ? value : []).map((v) => clean(v)).filter(Boolean).slice(0, maxItems);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Only signed-in app users can spend AI credits: the anon key alone is rejected
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!supabaseUrl || !anonKey) return json({ error: "Supabase environment not available" }, 500);
  const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authHeader, apikey: anonKey },
  });
  if (!userResp.ok) return json({ error: "Sign in to ask about names" }, 401);

  if (!Deno.env.get("ANTHROPIC_API_KEY")) {
    return json({ error: "ANTHROPIC_API_KEY secret not set" }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const name = clean(body?.name, 40);
  if (!name) return json({ error: "Missing name" }, 400);

  const info = body?.nameInfo ?? {};
  const family = body?.family ?? {};
  const parents = cleanList(family.parents, 2);
  const siblings = cleanList(family.siblings, 10);
  const surnames = cleanList(family.surnames, 3);
  const question = clean(body?.question, 300);

  const knownFacts = [
    info.gender ? `Gender in our list: ${clean(info.gender)}` : "",
    cleanList(info.origin).length ? `Origin in our list: ${cleanList(info.origin).join(", ")}` : "",
    info.meaning ? `Meaning in our list: ${clean(info.meaning, 120)}` : "",
  ].filter(Boolean).join("\n");

  const familyLines = [
    parents.length ? `Parents: ${parents.join(" and ")}` : "Parents: not given",
    surnames.length ? `Likely surname(s) for the baby: ${surnames.join(" or ")}` : "Surname: not given",
    siblings.length ? `Older siblings: ${siblings.join(", ")}` : "Older siblings: none given",
  ].join("\n");

  const system = `You are a warm, knowledgeable baby-name expert inside a name-picking app used by expecting parents.
Give accurate, specific facts. Only name real, well-known people as namesakes; if you are not sure someone is real and notable, leave them out rather than guess. Keep every field short and readable on a phone.
The family details are context for personalising the advice. Do not repeat the parents' full names back except inside full-name examples.`;

  const prompt = `Tell us about the baby name "${name}".

${knownFacts ? `What our app already says (correct it in "origin" if it's wrong):\n${knownFacts}\n\n` : ""}FAMILY:
${familyLines}

Fill each field:
- origin: 2-3 sentences on the name's origin, history and how its popularity has changed.
- namesakes: up to 4 famous people with this first name, each with a few words on what they're known for. Mix eras and fields.
- siblingFit: one entry per older sibling (leave empty if none): one sentence on how "${name}" sounds next to that sibling's name (style, sound, rhythm, matching initials or rhymes).
- fullName: examples = 1-2 ways the full name could read with the surname(s), adding a middle-name idea only if it helps; notes = one sentence on rhythm, initials and anything awkward. Leave examples empty and notes "" if no surname is known.
- considerations: up to 3 short practical points (pronunciation, spelling, teasing risk, nickname you can't avoid). Only real concerns.
- answer: ${question ? `answer the parents' question in 2-4 sentences: "${question}"` : `""`}`;

  const client = new Anthropic();
  let response;
  try {
    response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: INSIGHTS_SCHEMA },
      },
      system,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "AI is busy right now. Try again in a minute." }, 429);
    if (e instanceof Anthropic.APIError) return json({ error: "Anthropic API error", detail: e.message }, 502);
    return json({ error: "Failed to reach Anthropic API", detail: String(e) }, 502);
  }

  if (response.stop_reason === "refusal") {
    return json({ error: "The AI couldn't answer that. Try a different question." }, 422);
  }

  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  try {
    return json(JSON.parse(text));
  } catch {
    return json({ error: "Failed to parse AI response" }, 500);
  }
});
