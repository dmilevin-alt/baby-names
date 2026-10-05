const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY secret not set" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const {
    candidates = [], loveExamples = [], maybeExamples = [], excludeNames = [], quizContext = {},
  } = body;

  const MAX_PICKS = 10;
  const MAX_MAYBE_PICKS = 3;
  // Only invent names outside the app's list when the list can't fill the picks
  const newSlots = Math.max(0, MAX_PICKS - candidates.length);

  const fmtNames = (arr) =>
    arr.map((n) => {
      const tags = [(n.origin || []).join("/"), (n.style || []).join("/")].filter(Boolean).join("; ");
      return `${n.name} (${tags}${n.meaning ? ` — "${n.meaning}"` : ""})`;
    }).join(", ");

  const candLines = candidates
    .map((n) => `${n.name} | ${n.gender} | ${(n.origin || []).join("/")} | ${(n.style || []).join("/")} | ${n.meaning || ""}`)
    .join("\n");

  const candidateSection = candidates.length
    ? `CANDIDATE NAMES they haven't rated yet (name | gender | origin | style | meaning):\n${candLines}`
    : "CANDIDATE NAMES: none left. They have rated every name in the app that fits their preferences.";

  const newSection = newSlots > 0
    ? `
NEW NAMES: There aren't enough candidates, so also suggest up to ${newSlots} real, established given names that are NOT in the candidate list and NOT any of these names they've already rated: ${excludeNames.join(", ") || "none"}.
New names must fit the gender preference${quizContext.avoidLetters ? ` and must not start with ${quizContext.avoidLetters}` : ""}. Base them on what their loved names and maybe list have in common.`
    : "";

  const prompt = `You are a baby name advisor helping a couple narrow down their shortlist.

THEIR QUIZ PREFERENCES:
- Gender: ${quizContext.gender || "no preference"}
- Cultural backgrounds: ${(quizContext.backgrounds || []).join(", ") || "none specified"}
- Style: ${(quizContext.styles || []).join(", ") || "none specified"}
- Tradition/religion: ${(quizContext.tradition || []).join(", ") || "none specified"}
- Length preference: ${quizContext.length || "any"}${quizContext.includeLetters ? `\n- Prefer names starting with: ${quizContext.includeLetters}` : ""}${quizContext.avoidLetters ? `\n- Avoid names starting with: ${quizContext.avoidLetters}` : ""}

NAMES THEY LOVED: ${fmtNames(loveExamples) || "none yet"}
NAMES ON THEIR MAYBE LIST: ${fmtNames(maybeExamples) || "none yet"}

The maybe list holds names they're drawn to but haven't committed to. Treat it as a real signal of taste, weaker than loved names but stronger than quiz answers alone. Look for patterns across the maybe list (sounds, origins, styles, meanings, length) and recommend names that share what the maybe names have in common, especially where that overlaps with the loved names.

${candidateSection}

MAYBES WORTH A SECOND LOOK: You may also pick up to ${MAX_MAYBE_PICKS} names from their maybe list that fit their loved names and quiz answers best, to nudge them to decide. Only pick a maybe if it is a genuinely strong fit.
${newSection}

Pick up to ${MAX_PICKS} names in total. Prefer candidates over new names. Prioritise gender. Give varied picks. When a pick is inspired by maybe-list names, the reason may mention one of them.

Return ONLY a valid JSON array — no explanation, no markdown. Each element:
{"name":"<name>","source":"candidate" | "maybe" | "new","reason":"<one sentence max 12 words explaining why this fits>"}
For "new" names also include: "gender":"girl" | "boy" | "either","origin":["<lowercase origin>"],"style":["<lowercase style, e.g. classic, modern, nature, vintage, unique>"],"meaning":"<short meaning>","syllables":<number>`;

  let aiResp;
  try {
    aiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Failed to reach Anthropic API", detail: String(e) }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const aiData = await aiResp.json();

  if (!aiResp.ok) {
    return new Response(
      JSON.stringify({ error: "Anthropic API error", detail: aiData }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const raw = aiData?.content?.[0]?.text?.trim() ?? "";
  let picks;
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    picks = JSON.parse(match ? match[0] : raw);
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to parse AI response", raw }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  if (!Array.isArray(picks)) picks = [];

  // Keep only picks that obey the rules: real candidates, real maybes,
  // or new names the couple hasn't rated and that fit their filters
  const key = (s) => String(s || "").trim().toLowerCase();
  const candidateNames = new Set(candidates.map((n) => key(n.name)));
  const maybeNames = new Set(maybeExamples.map((n) => key(n.name)));
  const rated = new Set([...excludeNames, ...loveExamples.map((n) => n.name)].map(key));
  const avoid = new Set(String(quizContext.avoidLetters || "").toUpperCase().split(/[^A-Z]+/).filter(Boolean));
  const gender = ["girl", "boy"].includes(quizContext.gender) ? quizContext.gender : null;

  const seen = new Set();
  let maybeCount = 0, newCount = 0;
  const clean = [];
  for (const p of picks) {
    const name = String(p?.name || "").trim();
    const k = key(name);
    if (!name || seen.has(k) || !/^\p{L}[\p{L}' -]{0,29}$/u.test(name)) continue;
    const reason = typeof p.reason === "string" ? p.reason.slice(0, 200) : "";

    if (candidateNames.has(k)) {
      clean.push({ name, source: "candidate", reason });
    } else if (maybeNames.has(k)) {
      if (maybeCount >= MAX_MAYBE_PICKS) continue;
      maybeCount++;
      clean.push({ name, source: "maybe", reason });
    } else {
      if (newCount >= newSlots || rated.has(k) || avoid.has(name[0].toUpperCase())) continue;
      const g = ["girl", "boy", "either"].includes(p.gender) ? p.gender : "either";
      if (gender && g !== gender && g !== "either") continue;
      newCount++;
      clean.push({
        name, source: "new", reason, gender: g,
        origin: (Array.isArray(p.origin) ? p.origin : []).map((o) => key(o)).filter(Boolean).slice(0, 3),
        style: (Array.isArray(p.style) ? p.style : []).map((st) => key(st)).filter(Boolean).slice(0, 3),
        meaning: typeof p.meaning === "string" ? p.meaning.slice(0, 100) : "",
        syllables: Number.isInteger(p.syllables) && p.syllables > 0 && p.syllables < 8 ? p.syllables : null,
      });
    }
    seen.add(k);
    if (clean.length >= MAX_PICKS) break;
  }

  return new Response(JSON.stringify(clean), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
