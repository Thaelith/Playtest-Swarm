import type { PlaytestSwarmReport, AnalyzeRequest, EconomyData } from "./types";
import { simulateProgression, calculateUpgradeROI, estimateDropPacing } from "./simulation";

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "gemma-4-31b";
const CEREBRAS_BASE_URL = process.env.CEREBRAS_BASE_URL || "https://api.cerebras.ai/v1";

export function isCerebrasConfigured(): boolean {
  return Boolean(CEREBRAS_API_KEY);
}

function buildToolResults(economy: EconomyData) {
  const sim = simulateProgression(economy);
  const roi = calculateUpgradeROI(economy);
  const drops = estimateDropPacing(economy);

  return {
    simulation: {
      checkpoints: sim.checkpoints.map((c) => ({
        minute: c.minute,
        power: c.power,
        currency: c.currency,
        prestigeLevel: c.prestigeLevel,
      })),
      upgradesBought: sim.upgradesBought,
    },
    upgradeROI: roi.map((r) => ({
      id: r.id,
      name: r.name,
      costToMax: r.costToMax,
      powerAtMax: r.powerAtMax,
      efficiencyScore: r.efficiencyScore,
      flag: r.flag,
    })),
    dropPacing: drops.map((d) => ({
      rarityId: d.rarityId,
      rarityName: d.rarityName,
      expectedDropsPerHour: d.expectedDropsPerHour,
      effectiveExcitement: d.effectiveExcitement,
      issue: d.issue ?? null,
    })),
  };
}

const SYSTEM_PROMPT = `You are Playtest Swarm, a multi-agent game QA system. You analyze game screenshots and economy data to produce structured playtest reports.

You simulate the following 9 specialized agents. Each must produce exactly one finding:

1. Vision Parser Agent — Analyze screenshot visual hierarchy, UI layout, element placement, font sizes, color contrast
2. First-Time Player Agent — Simulate a new player's first session: what do they see first, what confuses them, what's missing
3. Mobile UX Agent — Evaluate touch targets, thumb zones, readability on small screens, one-handed use
4. Progression Clarity Agent — Check if players understand what to do next at each stage; identify dead zones
5. Economy Analyst Agent — Analyze balance, inflation, reward pacing, cost curves, currency sinks
6. Casual Player Persona Agent — Simulate a 15-20 min session player: where do they churn, what feels rewarding
7. Min-Max Player Persona Agent — Simulate an optimizer: what's the most efficient path, what's a trap
8. Patch Designer Agent — Propose specific, versioned balance changes with before/after values
9. Critic Agent — Cross-validate all other agents' findings, flag contradictions, prioritize by impact

LOCAL_TOOL_RESULTS are provided below. Use them as ground truth. Do not invent numbers that contradict the tool output.

Respond with a single JSON object matching the PlaytestSwarmReport schema:
{
  "summary": { "overallScore": number 0-100, "mainRisk": string, "recommendedAction": string },
  "agents": [{ "name": string, "role": string, "status": "passed"|"warning"|"failed", "finding": string, "severity": "low"|"medium"|"high" }],
  "uiIssues": [{ "area": string, "problem": string, "evidence": string, "whyItHurts": string, "fix": string, "severity": "low"|"medium"|"high" }],
  "balanceIssues": [{ "system": string, "problem": string, "evidence": string, "suggestedChange": string, "severity": "low"|"medium"|"high" }],
  "balancePatch": { "version": string, "changes": [{ "path": string, "oldValue": string|number, "newValue": string|number, "reason": string }] },
  "exports": { "playtestReportMarkdown": string, "uiFixBriefMarkdown": string, "balancePatchJson": string, "socialDemoSummary": string }
}

Return ONLY the JSON object. No markdown fences, no surrounding text.`;

function buildUserPrompt(input: AnalyzeRequest): string {
  const toolResults = buildToolResults(input.economy);

  return `Analyze this game:

METADATA
Genre: ${input.genre}
Platform: ${input.platform}
Screen Goal: ${input.screenGoal}

ECONOMY DATA
${JSON.stringify(input.economy, null, 2)}

LOCAL_TOOL_RESULTS
${JSON.stringify(toolResults, null, 2)}

Generate a complete PlaytestSwarmReport. Use the LOCAL_TOOL_RESULTS as evidence for your analysis.`;
}

export function validateAndNormalizeReport(raw: unknown): PlaytestSwarmReport {
  const r = raw as Record<string, unknown>;

  const summary = (r.summary as Record<string, unknown>) || {};
  const metrics = (r.demoMetrics as Record<string, unknown>) || {};
  const agents = Array.isArray(r.agents) ? r.agents : [];
  const uiIssues = Array.isArray(r.uiIssues) ? r.uiIssues : [];
  const balanceIssues = Array.isArray(r.balanceIssues) ? r.balanceIssues : [];
  const balancePatch = (r.balancePatch as Record<string, unknown>) || {};
  const exports = (r.exports as Record<string, unknown>) || {};

  const validSeverities = new Set(["low", "medium", "high"]);
  const validStatuses = new Set(["passed", "warning", "failed"]);

  const overallScore = Math.max(0, Math.min(100, Number(summary.overallScore) || 0));

  const mode = metrics.mode === "cerebras" ? "cerebras" : "mock";

  return {
    summary: {
      overallScore,
      mainRisk: String(summary.mainRisk || "No risk data available"),
      recommendedAction: String(
        summary.recommendedAction || "Review agent findings and apply suggested changes"
      ),
    },
    demoMetrics: {
      model: String(metrics.model || CEREBRAS_MODEL),
      mode,
      totalTimeSeconds: Number(metrics.totalTimeSeconds) || 0,
      tokensPerSecond: metrics.tokensPerSecond != null ? Number(metrics.tokensPerSecond) : undefined,
      agentsRun: Number(metrics.agentsRun) || agents.length || 9,
      toolCallsRun: Number(metrics.toolCallsRun) || 6,
      cerebrasError: metrics.cerebrasError != null ? String(metrics.cerebrasError) : undefined,
    },
    agents: (agents as Record<string, unknown>[]).map((a) => ({
      name: String(a.name || "Unknown Agent"),
      role: String(a.role || "Analysis"),
      status: validStatuses.has(a.status as string) ? (a.status as "passed" | "warning" | "failed") : "warning",
      finding: String(a.finding || "No finding recorded"),
      severity: validSeverities.has(a.severity as string)
        ? (a.severity as "low" | "medium" | "high")
        : "medium",
    })),
    uiIssues: (uiIssues as Record<string, unknown>[]).map((u) => ({
      area: String(u.area || "Unknown"),
      problem: String(u.problem || ""),
      evidence: String(u.evidence || ""),
      whyItHurts: String(u.whyItHurts || ""),
      fix: String(u.fix || ""),
      severity: validSeverities.has(u.severity as string)
        ? (u.severity as "low" | "medium" | "high")
        : "medium",
    })),
    balanceIssues: (balanceIssues as Record<string, unknown>[]).map((b) => ({
      system: String(b.system || "Unknown"),
      problem: String(b.problem || ""),
      evidence: String(b.evidence || ""),
      suggestedChange: String(b.suggestedChange || ""),
      severity: validSeverities.has(b.severity as string)
        ? (b.severity as "low" | "medium" | "high")
        : "medium",
    })),
    balancePatch: {
      version: String(balancePatch.version || "1.0.0-patch"),
      changes: Array.isArray(balancePatch.changes)
        ? (balancePatch.changes as Record<string, unknown>[]).map((c) => ({
            path: String(c.path || ""),
            oldValue: c.oldValue as string | number,
            newValue: c.newValue as string | number,
            reason: String(c.reason || ""),
          }))
        : [],
    },
    exports: {
      playtestReportMarkdown: String(
        exports.playtestReportMarkdown || "# Playtest Report\n\nNo report generated."
      ),
      uiFixBriefMarkdown: String(
        exports.uiFixBriefMarkdown || "# UI Fix Brief\n\nNo fix brief generated."
      ),
      balancePatchJson: String(
        exports.balancePatchJson || '{"version":"0.0.0","changes":[]}'
      ),
      socialDemoSummary: String(
        exports.socialDemoSummary || "Playtest Swarm analysis complete."
      ),
    },
  };
}

function extractJSONFromResponse(raw: string): string {
  let jsonStr = raw.trim();

  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  const firstBrace = jsonStr.indexOf("{");
  const lastBrace = jsonStr.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
  }

  return jsonStr;
}

export async function runCerebrasPlaytestAnalysis(
  input: AnalyzeRequest
): Promise<PlaytestSwarmReport & { rawResponse?: { totalTokens?: number; completionTokens?: number; promptTokens?: number; timeInfo?: Record<string, unknown> } }> {
  if (!isCerebrasConfigured()) {
    throw new Error("Cerebras API key not configured. Set CEREBRAS_API_KEY environment variable.");
  }

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: buildUserPrompt(input) },
  ];

  const body: Record<string, unknown> = {
    model: CEREBRAS_MODEL,
    messages,
    max_tokens: 4096,
    temperature: 0.3,
    response_format: { type: "json_object" },
  };

  const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cerebras API error ${response.status}: ${errorText.slice(0, 500)}`
    );
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty or invalid response from Cerebras API");
  }

  const usage = data.usage || {};
  const totalTokens = usage.total_tokens as number | undefined;
  const completionTokens = usage.completion_tokens as number | undefined;
  const promptTokens = usage.prompt_tokens as number | undefined;
  const timeInfo = data.time_info as Record<string, unknown> | undefined;

  let parsed: unknown;
  const jsonStr = extractJSONFromResponse(raw);
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(
      `Failed to parse Cerebras response as JSON. Raw: ${raw.slice(0, 300)}`
    );
  }

  const report = validateAndNormalizeReport(parsed);

  return {
    ...report,
    rawResponse: { totalTokens, completionTokens, promptTokens, timeInfo },
  };
}
