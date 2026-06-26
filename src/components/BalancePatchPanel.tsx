"use client";

import type { PlaytestSwarmReport } from "@/lib/types";

type Props = {
  report: PlaytestSwarmReport | null;
};

export default function BalancePatchPanel({ report }: Props) {
  if (!report) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Balance Patch v{report.balancePatch.version}
      </h3>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left p-3 font-medium">Path</th>
              <th className="text-left p-3 font-medium">Old</th>
              <th className="text-left p-3 font-medium">New</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Reason</th>
            </tr>
          </thead>
          <tbody>
            {report.balancePatch.changes.map((change, i) => (
              <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                <td className="p-3 text-zinc-300 font-mono text-[11px]">{change.path}</td>
                <td className="p-3 text-red-400">{String(change.oldValue)}</td>
                <td className="p-3 text-green-400">{String(change.newValue)}</td>
                <td className="p-3 text-zinc-500 hidden md:table-cell">{change.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
