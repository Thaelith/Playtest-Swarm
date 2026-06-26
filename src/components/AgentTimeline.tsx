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
          <div key={name} className="flex items-center gap-3">
            <div
              className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
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

  const statusColor: Record<string, string> = {
    passed: "bg-green-500",
    warning: "bg-yellow-500",
    failed: "bg-red-500",
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Agent Results ({report.agents.length})
      </h3>
      {report.agents.map((agent) => (
        <div
          key={agent.name}
          className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800"
        >
          <div className={`h-2.5 w-2.5 rounded-full ${statusColor[agent.status]}`} />
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
            className={`text-[10px] font-semibold uppercase ${
              agent.status === "passed"
                ? "text-green-400"
                : agent.status === "warning"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {agent.status}
          </span>
        </div>
      ))}
    </div>
  );
}
