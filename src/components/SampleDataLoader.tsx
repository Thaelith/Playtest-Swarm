"use client";

import { useState } from "react";

type Props = {
  onLoad: (data: object) => void;
  sampleData: object;
};

export default function SampleDataLoader({ onLoad, sampleData }: Props) {
  const [loaded, setLoaded] = useState(false);

  function loadSample() {
    onLoad(sampleData);
    setLoaded(true);
  }

  return (
    <button
      onClick={loadSample}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        loaded
          ? "bg-green-900/40 text-green-300 border border-green-700/50"
          : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white"
      }`}
    >
      {loaded ? "✓ Sample Loaded" : "Load Sample: StarForge Idle RPG"}
    </button>
  );
}
