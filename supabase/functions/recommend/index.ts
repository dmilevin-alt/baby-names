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

  const { candidates = [], loveExamples = [], maybeExamples = [], quizContext = {} } = body;

  const fmtNames = (arr) =>
    arr.map((n) => `${n.name} (${(n.origin || []).join("/")}${n.meaning ? ` — "${n.meaning}"` : ""})`).join(", ");

  const candLines = candidates
    .map((n) => `${n.name} | ${n.gender} | ${(n.origin || []).join("/")} | ${(n.style || []).join("/")} | ${n.meaning || ""}`)
    .join("\n");

  const prompt = `You are a baby name advisor helping a couple narrow down their shortlist.

THEIR QUIZ PREFERENCES:
- Gender: ${quizContext.gender || "no preference"}
- Cultural backgrounds: ${(quizContext.backgrounds || []).join(", ") || "none specified"}
- Style: ${(quizContext.styles || []).join(", ") || "none specified"}
- Tradition/religion: ${(quizContext.tradition || []).join(", ") || "none specified"}
- Length preference: ${quizContext.length || "any"}${quizContext.includeLetters ? `\n- Prefer names starting with: ${quizContext.includeLetters}` : ""}${quizContext.avoidLetters ? `\n- Avoid names starting with: ${quizContext.avoidLetters}` : ""}

NAMES THEY LOVED: ${fmtNames(loveExamples) || "none yet"}
NAMES THEY MAYBE'D: ${fmtNames(maybeExamples) || "none yet"}

CANDIDATE NAMES (name | gender | origin | style | meaning):
${candLines}

Pick the 10 candidates that best match their taste and quiz preferences. Prioritise gender. Give varied picks.

Return ONLY a valid JSON array — no explanation, no markdown. Each element:
{"name":"<name>","reason":"<one sentence max 12 words explaining why this fits>"}`;

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
        max_tokens: 900,
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

  return new Response(JSON.stringify(picks), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
