"use client";

import type { PlaytestSwarmReport } from "@/lib/types";

type Props = {
  report: PlaytestSwarmReport | null;
};

export default function ResultsDashboard({ report }: Props) {
  if (!report) return null;

  const scoreColor =
    report.summary.overallScore >= 70
      ? "text-green-400"
      : report.summary.overallScore >= 40
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Summary
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
          <div className={`text-3xl font-bold ${scoreColor}`}>
            {report.summary.overallScore}
          </div>
          <div className="text-xs text-zinc-500 mt-1">/100 Score</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-xl font-bold text-zinc-200">
            {report.demoMetrics.agentsRun}
          </div>
          <div className="text-xs text-zinc-500 mt-1">Agents</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-xl font-bold text-zinc-200">
            {report.demoMetrics.totalTimeSeconds.toFixed(2)}s
          </div>
          <div className="text-xs text-zinc-500 mt-1">Total Time</div>
        </div>
      </div>

      <div className="bg-red-900/20 border border-red-900/30 rounded-xl p-4">
        <div className="text-xs text-red-400 uppercase tracking-wider font-semibold mb-1">
          Main Risk
        </div>
        <p className="text-sm text-red-200">{report.summary.mainRisk}</p>
      </div>

      <div className="bg-blue-900/20 border border-blue-900/30 rounded-xl p-4">
        <div className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-1">
          Recommended Action
        </div>
        <p className="text-sm text-blue-200">{report.summary.recommendedAction}</p>
      </div>
    </div>
  );
}
