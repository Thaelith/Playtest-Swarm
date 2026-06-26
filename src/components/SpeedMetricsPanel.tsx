"use client";

import type { PlaytestSwarmReport } from "@/lib/types";

type Props = {
  report: PlaytestSwarmReport | null;
  loading: boolean;
};

export default function SpeedMetricsPanel({ report, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Cerebras Speed Demo
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 w-16 bg-zinc-800 rounded mb-2" />
              <div className="h-6 w-12 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Cerebras Speed Demo
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Model</div>
          <div className="text-sm font-medium text-zinc-200 mt-1">
            {report.demoMetrics.model}
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Mode</div>
          <div className="text-sm font-medium text-zinc-200 mt-1">
            <span
              className={`inline-flex items-center gap-1 ${
                report.demoMetrics.mode === "cerebras"
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {report.demoMetrics.mode === "mock" && (
                <span className="text-[10px] bg-yellow-900/40 text-yellow-400 px-1 py-0.5 rounded">
                  MOCK
                </span>
              )}
              {report.demoMetrics.mode === "cerebras" ? "Cerebras" : "Mock"}
            </span>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Time</div>
          <div className="text-sm font-medium text-zinc-200 mt-1">
            {report.demoMetrics.totalTimeSeconds.toFixed(2)}s
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Tokens/s</div>
          <div className="text-sm font-medium text-zinc-200 mt-1">
            {report.demoMetrics.tokensPerSecond
              ? report.demoMetrics.tokensPerSecond.toFixed(0)
              : "—"}
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Agents</div>
          <div className="text-sm font-medium text-zinc-200 mt-1">
            {report.demoMetrics.agentsRun}
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Tool Calls</div>
          <div className="text-sm font-medium text-zinc-200 mt-1">
            {report.demoMetrics.toolCallsRun}
          </div>
        </div>
      </div>
    </div>
  );
}
