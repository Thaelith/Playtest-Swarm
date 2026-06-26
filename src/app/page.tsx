"use client";

import { useState } from "react";
import type { PlaytestSwarmReport, EconomyData } from "@/lib/types";
import sampleEconomy from "@/samples/starforge-economy.json";
import SampleDataLoader from "@/components/SampleDataLoader";
import UploadPanel from "@/components/UploadPanel";
import AgentTimeline from "@/components/AgentTimeline";
import ResultsDashboard from "@/components/ResultsDashboard";
import UIIssuesPanel from "@/components/UIIssuesPanel";
import BalanceIssuesPanel from "@/components/BalanceIssuesPanel";
import BalancePatchPanel from "@/components/BalancePatchPanel";
import ExportPanel from "@/components/ExportPanel";
import SpeedMetricsPanel from "@/components/SpeedMetricsPanel";

export default function Home() {
  const [economy, setEconomy] = useState<EconomyData | null>(null);
  const [economyJson, setEconomyJson] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [genre, setGenre] = useState("Idle RPG");
  const [platform, setPlatform] = useState("Mobile");
  const [screenGoal, setScreenGoal] = useState("Main gameplay HUD");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PlaytestSwarmReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleLoadSample(data: object) {
    setEconomy(data as EconomyData);
    setEconomyJson(JSON.stringify(data, null, 2));
  }

  function handlePasteJson() {
    try {
      const parsed = JSON.parse(economyJson);
      setEconomy(parsed);
      setError(null);
    } catch {
      setError("Invalid JSON. Please check your economy data format.");
    }
  }

  async function runAnalysis() {
    if (!economy) {
      setError("Please load or paste an economy JSON first.");
      return;
    }

    setLoading(true);
    setReport(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenshotBase64: screenshot,
          economy,
          genre,
          platform,
          screenGoal,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Analysis failed");
      }

      const data: PlaytestSwarmReport = await res.json();
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-sm font-bold">
              PS
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Playtest Swarm</h1>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
              Hackathon Demo
            </span>
          </div>
          <p className="text-zinc-500 max-w-2xl text-sm">
            Real-time AI playtesting for indie games. Multi-agent analysis powered by Cerebras Gemma 4 31B.
            Upload a screenshot and economy JSON — get a full playtest report in seconds.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="space-y-6">
            {/* Sample Loader */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Quick Start
              </h2>
              <SampleDataLoader onLoad={handleLoadSample} sampleData={sampleEconomy} />
            </section>

            {/* Economy JSON Paste */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Economy JSON
              </h2>
              <textarea
                value={economyJson}
                onChange={(e) => setEconomyJson(e.target.value)}
                placeholder='Paste your economy JSON here or click "Load Sample" above...'
                className="w-full h-40 bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none resize-y"
              />
              <button
                onClick={handlePasteJson}
                className="mt-3 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium border border-zinc-700 hover:border-zinc-500 hover:text-white transition-colors"
              >
                Parse JSON
              </button>
              {economy && (
                <p className="mt-2 text-xs text-green-400">
                  ✓ {economy.gameName} loaded ({economy.rarities.length} rarities,{" "}
                  {economy.upgrades.length} upgrades)
                </p>
              )}
            </section>

            {/* Screenshot Upload */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Screenshot
              </h2>
              <UploadPanel onScreenshot={setScreenshot} />
            </section>

            {/* Metadata */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Game Metadata
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Genre</label>
                  <input
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Platform</label>
                  <input
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-500 block mb-1">Screen Goal</label>
                  <input
                    value={screenGoal}
                    onChange={(e) => setScreenGoal(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Run Button */}
            <button
              onClick={runAnalysis}
              disabled={loading || !economy}
              className="w-full py-4 rounded-xl font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-900/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Agents Analyzing...
                </span>
              ) : (
                "Run Playtest Swarm"
              )}
            </button>

            {error && (
              <div className="bg-red-900/20 border border-red-900/30 rounded-xl p-4 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            {/* Agent Timeline */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <AgentTimeline report={report} loading={loading} />
            </section>

            {report && (
              <>
                {/* Speed Metrics */}
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <SpeedMetricsPanel report={report} loading={false} />
                </section>

                {/* Results Dashboard */}
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <ResultsDashboard report={report} />
                </section>

                {/* UI Issues */}
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <UIIssuesPanel report={report} />
                </section>

                {/* Balance Issues */}
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <BalanceIssuesPanel report={report} />
                </section>

                {/* Balance Patch */}
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <BalancePatchPanel report={report} />
                </section>

                {/* Export */}
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <ExportPanel report={report} />
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-zinc-600">
          <span>Playtest Swarm — Hackathon Demo</span>
          <span>Powered by Cerebras · gemma-4-31b</span>
        </div>
      </footer>
    </div>
  );
}
