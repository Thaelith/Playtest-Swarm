import type { PlaytestSwarmReport, AnalyzeRequest } from "./types";
import { runMockPlaytestAnalysis } from "./agents.mock";
import { runCerebrasPlaytestAnalysis, isCerebrasConfigured } from "./cerebras";

export async function runPlaytest(input: AnalyzeRequest): Promise<PlaytestSwarmReport> {
  const startTime = Date.now();

  if (isCerebrasConfigured()) {
    try {
      const rawResult = await runCerebrasPlaytestAnalysis(input);
      const raw = "rawResponse" in rawResult
        ? (rawResult as typeof rawResult & { rawResponse: Record<string, unknown> }).rawResponse
        : undefined;

      const completionTokens = raw?.completionTokens as number | undefined;
      const endTime = Date.now();
      const totalTimeSeconds = (endTime - startTime) / 1000;

      const tokensPerSecond = totalTimeSeconds > 0 && completionTokens
        ? completionTokens / totalTimeSeconds
        : undefined;

      const { rawResponse: _r, ...result } = rawResult as typeof rawResult & { rawResponse?: unknown };
      void _r;

      return {
        ...result,
        demoMetrics: {
          model: process.env.CEREBRAS_MODEL || "gemma-4-31b",
          mode: "cerebras",
          totalTimeSeconds,
          tokensPerSecond,
          agentsRun: result.agents.length,
          toolCallsRun: 6,
        },
      };
    } catch (error) {
      console.error(
        "Cerebras API call failed, falling back to mock mode:",
        error instanceof Error ? error.message : error
      );

      const fallbackReport = buildMockReport(input, startTime);
      return {
        ...fallbackReport,
        demoMetrics: {
          ...fallbackReport.demoMetrics,
          mode: "mock",
          cerebrasError:
            "Cerebras API unavailable. Results are mock-generated. Original error: " +
            (error instanceof Error ? error.message : String(error)),
        },
        summary: {
          ...fallbackReport.summary,
          recommendedAction:
            "[CEREBRAS FALLBACK: Real API failed, using mock analysis] " +
            fallbackReport.summary.recommendedAction,
        },
      };
    }
  }

  return buildMockReport(input, startTime);
}

function buildMockReport(
  input: AnalyzeRequest,
  startTime: number
): PlaytestSwarmReport {
  const mockResult = runMockPlaytestAnalysis(input.economy, input.screenshotBase64);

  const totalTimeSeconds = (Date.now() - startTime) / 1000;
  const failedAgents = mockResult.agents.filter((a) => a.status === "failed").length;
  const overallScore = Math.max(
    0,
    Math.min(100, 100 - failedAgents * 15 - mockResult.balanceIssues.filter((b) => b.severity === "high").length * 10)
  );

  const highSeverity = [...mockResult.uiIssues, ...mockResult.balanceIssues].filter((i) => i.severity === "high");
  const mainRisk =
    highSeverity.length > 0 ? highSeverity[0].problem : "No critical risks detected";

  const recommendedAction =
    overallScore < 50
      ? "Apply balance patch immediately and fix critical UI issues before next playtest"
      : "Apply suggested changes and re-test. Economy is functional but has optimization opportunities.";

  return {
    summary: {
      overallScore,
      mainRisk,
      recommendedAction,
    },
    demoMetrics: {
      model: "gemma-4-31b (mock)",
      mode: "mock",
      totalTimeSeconds,
      tokensPerSecond: 0,
      agentsRun: mockResult.agents.length,
      toolCallsRun: 6,
    },
    agents: mockResult.agents,
    uiIssues: mockResult.uiIssues,
    balanceIssues: mockResult.balanceIssues,
    balancePatch: mockResult.balancePatch,
    exports: {
      playtestReportMarkdown: mockResult.playtestReportMarkdown,
      uiFixBriefMarkdown: mockResult.uiFixBriefMarkdown,
      balancePatchJson: JSON.stringify(mockResult.balancePatch, null, 2),
      socialDemoSummary: mockResult.socialDemoSummary,
    },
  };
}
