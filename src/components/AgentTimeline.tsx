"use client";

import type { PlaytestSwarmReport } from "@/lib/types";

type Props = {
  report: PlaytestSwarmReport | null;
  loading: boolean;
};

export default function AgentTimeline({ report, loading }: Props) {
  if (loading) {
    const fakeAgents = [
      "Vision Parser",
      "First-Time Player",
      "Mobile UX",
      "Progression Clarity",
      "Economy Analyst",
      "Casual Player Persona",
      "Min-Max Player Persona",
      "Patch Designer",
      "Critic",
    ];

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Agents Running
        </h3>
        {fakeAgents.map((name, i) => (
          <div
            key={name}
            className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800"
          >
            <span className="text-xs font-mono text-zinc-600 w-5 text-right">
              {(i + 1).toString().padStart(2, "0")}
            </span>
            <span className="text-sm text-zinc-500">{name}</span>
            <span className="text-xs text-zinc-600 ml-auto">
              {i === 0 ? "analyzing..." : "queued"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (!report) return null;

  const statusLabel: Record<string, string> = {
    passed: "PASS",
    warning: "WARN",
    failed: "FAIL",
  };

  const statusStyle: Record<string, string> = {
    passed: "bg-green-900/40 text-green-400 border-green-800/40",
    warning: "bg-yellow-900/40 text-yellow-400 border-yellow-800/40",
    failed: "bg-red-900/40 text-red-400 border-red-800/40",
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Agent Results ({report.agents.length})
      </h3>
      {report.agents.map((agent, i) => (
        <div
          key={agent.name}
          className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
        >
          <span className="text-xs font-mono text-zinc-600 w-5 text-right">
            {(i + 1).toString().padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-200">
                {agent.name}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                  agent.severity === "high"
                    ? "bg-red-900/40 text-red-400"
                    : agent.severity === "medium"
                    ? "bg-yellow-900/40 text-yellow-400"
                    : "bg-green-900/40 text-green-400"
                }`}
              >
                {agent.severity}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{agent.finding}</p>
          </div>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase ${statusStyle[agent.status]}`}
          >
            {statusLabel[agent.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
