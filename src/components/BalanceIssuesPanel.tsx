"use client";

import type { PlaytestSwarmReport } from "@/lib/types";

type Props = {
  report: PlaytestSwarmReport | null;
};

export default function BalanceIssuesPanel({ report }: Props) {
  if (!report || report.balanceIssues.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Balance Issues ({report.balanceIssues.length})
      </h3>
      {report.balanceIssues.map((issue, i) => (
        <div
          key={i}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold border ${
                issue.severity === "high"
                  ? "bg-red-900/40 text-red-400 border-red-800/40"
                  : issue.severity === "medium"
                  ? "bg-yellow-900/40 text-yellow-400 border-yellow-800/40"
                  : "bg-green-900/40 text-green-400 border-green-800/40"
              }`}
            >
              {issue.severity}
            </span>
            <span className="text-sm font-medium text-zinc-200">{issue.system}</span>
          </div>
          <p className="text-sm text-zinc-300 mb-1">{issue.problem}</p>
          <p className="text-xs text-zinc-600 mb-2">{issue.evidence}</p>
          <div className="text-xs bg-blue-900/20 border border-blue-900/30 rounded-lg p-2">
            <span className="text-blue-400 font-medium">Suggested: </span>
            <span className="text-blue-300">{issue.suggestedChange}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
