"use client";

import { useState } from "react";
import type { PlaytestSwarmReport } from "@/lib/types";

type Props = {
  report: PlaytestSwarmReport | null;
};

export default function ExportPanel({ report }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!report) return null;

  async function copy(label: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      alert("Failed to copy. Check clipboard permissions.");
    }
  }

  const items = [
    {
      label: "Balance Patch JSON",
      content: report.exports.balancePatchJson,
      icon: "{}",
    },
    {
      label: "Playtest Report MD",
      content: report.exports.playtestReportMarkdown,
      icon: "MD",
    },
    {
      label: "UI Fix Brief MD",
      content: report.exports.uiFixBriefMarkdown,
      icon: "UI",
    },
    {
      label: "Social Summary",
      content: report.exports.socialDemoSummary,
      icon: "#",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Export
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => copy(item.label, item.content)}
            className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-300 hover:border-zinc-600 hover:text-white transition-colors text-left"
          >
            <span className="text-xs font-mono text-zinc-500 w-6 text-center">
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {copied === item.label && (
              <span className="text-xs text-green-400">Copied</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
