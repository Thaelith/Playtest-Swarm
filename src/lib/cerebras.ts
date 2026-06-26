import type { PlaytestSwarmReport, AnalyzeRequest } from "./types";

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "gemma-4-31b";
const CEREBRAS_BASE_URL = process.env.CEREBRAS_BASE_URL || "https://api.cerebras.ai/v1";

export function isCerebrasConfigured(): boolean {
  return Boolean(CEREBRAS_API_KEY);
}

export async function runCerebrasPlaytestAnalysis(
  input: AnalyzeRequest
): Promise<PlaytestSwarmReport> {
  if (!isCerebrasConfigured()) {
    throw new Error("Cerebras API key not configured");
  }

  const messages: {
    role: "system" | "user";
    content: string | { type: string; text?: string; image_url?: { url: string } }[];
  }[] = [
    {
      role: "system",
      content: `You are a game design QA analyst. Analyze the provided game economy and screenshot.
Return a JSON report matching the PlaytestSwarmReport schema with all fields populated.

Key analysis areas:
- First-time player clarity
- UI/UX readability
- Mobile usability
- Progression communication
- Economy balance
- Upgrade ROI
- Drop-rate pacing
- Suggested balance patch

IMPORTANT: Return ONLY valid JSON. No markdown wrapping, no code fences.`,
    },
  ];

  const userContent: { type: string; text?: string; image_url?: { url: string } }[] = [];

  if (input.screenshotBase64) {
    userContent.push({
      type: "image_url",
      image_url: { url: input.screenshotBase64 },
    });
  }

  userContent.push({
    type: "text",
    text: `Analyze this game:
Genre: ${input.genre}
Platform: ${input.platform}
Screen Goal: ${input.screenGoal}

Economy Data:
${JSON.stringify(input.economy, null, 2)}

Return a complete PlaytestSwarmReport JSON.`,
  });

  messages.push({ role: "user", content: userContent });

  const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify({
      model: CEREBRAS_MODEL,
      messages,
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cerebras API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response from Cerebras API");

  let parsed: PlaytestSwarmReport;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const cleaned = raw
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  }

  return parsed;
}
