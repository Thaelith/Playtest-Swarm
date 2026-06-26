import type { PlaytestSwarmReport, AnalyzeRequest } from "./types";
import { runMockPlaytestAnalysis } from "./agents.mock";
import { runCerebrasPlaytestAnalysis, isCerebrasConfigured } from "./cerebras";

export async function runPlaytest(input: AnalyzeRequest): Promise<PlaytestSwarmReport> {
  const startTime = Date.now();

  if (isCerebrasConfigured()) {
    try {
      const result = await runCerebrasPlaytestAnalysis(input);
      const endTime = Date.now();
      return {
        ...result,
        demoMetrics: {
          ...result.demoMetrics,
          model: process.env.CEREBRAS_MODEL || "gemma-4-31b",
          mode: "cerebras",
          totalTimeSeconds: (endTime - startTime) / 1000,
          agentsRun: result.agents.length,
          toolCallsRun: 6,
        },
      };
    } catch (error) {
      console.error("Cerebras API call failed, falling back to mock mode:", error);
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
