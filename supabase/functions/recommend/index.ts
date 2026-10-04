import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const { candidates, loveExamples, maybeExamples, quizContext } = await req.json();

  const fmt = (names: { name: string; origin: string[]; style: string[]; meaning: string }[]) =>
    names.map(n => `${n.name} (${n.origin.join("/")}${n.meaning ? ` — "${n.meaning}"` : ""})`).join(", ");

  const candLines = (candidates as { name: string; gender: string; origin: string[]; style: string[]; meaning: string }[])
    .map(n => `${n.name} | ${n.gender} | ${n.origin.join("/")} | ${n.style.join("/")} | ${n.meaning || ""}`)
    .join("\n");

  const prompt = `You are a baby name advisor helping a couple narrow down their shortlist.

THEIR QUIZ PREFERENCES:
- Gender: ${quizContext.gender || "no preference"}
- Cultural backgrounds: ${quizContext.backgrounds?.join(", ") || "none specified"}
- Style: ${quizContext.styles?.join(", ") || "none specified"}
- Tradition/religion: ${quizContext.tradition?.join(", ") || "none specified"}
- Length preference: ${quizContext.length || "any"}
${quizContext.includeLetters ? `- Prefer names starting with: ${quizContext.includeLetters}` : ""}
${quizContext.avoidLetters  ? `- Avoid names starting with: ${quizContext.avoidLetters}` : ""}

NAMES THEY LOVED: ${fmt(loveExamples) || "none yet"}
NAMES THEY MAYBE'D: ${fmt(maybeExamples) || "none yet"}

CANDIDATE NAMES (name | gender | origin | style | meaning):
${candLines}

Pick the 10 candidates that best match their taste and quiz preferences. Prioritise their quiz answers — especially gender. Give varied picks across origins and styles where possible.

Return ONLY a valid JSON array — no explanation, no markdown fences. Each element:
{"name":"<name>","reason":"<one sentence max 12 words explaining the fit>"}`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return new Response(JSON.stringify({ error: err }), {
      status: 502, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const data = await resp.json();
  const raw  = data.content?.[0]?.text?.trim() ?? "";

  let picks;
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    picks = JSON.parse(match ? match[0] : raw);
  } catch {
    return new Response(JSON.stringify({ error: "Failed to parse AI response", raw }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(picks), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
