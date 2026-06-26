export type PlaytestSwarmReport = {
  summary: {
    overallScore: number;
    mainRisk: string;
    recommendedAction: string;
  };
  demoMetrics: {
    model: string;
    mode: "mock" | "cerebras";
    totalTimeSeconds: number;
    tokensPerSecond?: number;
    agentsRun: number;
    toolCallsRun: number;
  };
  agents: {
    name: string;
    role: string;
    status: "passed" | "warning" | "failed";
    finding: string;
    severity: "low" | "medium" | "high";
  }[];
  uiIssues: {
    area: string;
    problem: string;
    evidence: string;
    whyItHurts: string;
    fix: string;
    severity: "low" | "medium" | "high";
  }[];
  balanceIssues: {
    system: string;
    problem: string;
    evidence: string;
    suggestedChange: string;
    severity: "low" | "medium" | "high";
  }[];
  balancePatch: {
    version: string;
    changes: {
      path: string;
      oldValue: string | number;
      newValue: string | number;
      reason: string;
    }[];
  };
  exports: {
    playtestReportMarkdown: string;
    uiFixBriefMarkdown: string;
    balancePatchJson: string;
    socialDemoSummary: string;
  };
};

export type EconomyData = {
  gameName: string;
  genre: string;
  platform: string;
  targetSessionMinutes: number;
  currencies: {
    id: string;
    name: string;
    icon: string;
  }[];
  rarities: {
    id: string;
    name: string;
    color: string;
    dropWeight: number;
    statMultiplier: number;
    expectedPerHour: number;
  }[];
  upgrades: {
    id: string;
    name: string;
    baseCost: number;
    costGrowth: number;
    powerGain: number;
    unlockMinute: number;
  }[];
  itemTypes: {
    slot: string;
    name: string;
    baseStats: number;
  }[];
  prestige: {
    levels: {
      tier: number;
      cost: number;
      reward: string;
      multiplier: number;
    }[];
  };
  offlineIncome: {
    maxHours: number;
    efficiency: number;
  };
  unlocks: {
    feature: string;
    unlockMinute: number;
    description: string;
  }[];
};

export type AnalyzeRequest = {
  screenshotBase64: string | null;
  economy: EconomyData;
  genre: string;
  platform: string;
  screenGoal: string;
};

export type SimResult = {
  checkpoints: { minute: number; power: number; currency: number; prestigeLevel: number }[];
  upgradesBought: string[];
};

export type RoiResult = {
  id: string;
  name: string;
  costToMax: number;
  powerAtMax: number;
  efficiencyScore: number;
  flag: "good" | "warning" | "bad";
}[];

export type DropResult = {
  rarityId: string;
  rarityName: string;
  expectedDropsPerHour: number;
  effectiveExcitement: "common-feel" | "exciting" | "rare-feel";
  issue?: string;
}[];

export type PatchDiff = {
  path: string;
  before: string | number;
  after: string | number;
  reason: string;
}[];

export type AgentResult = {
  name: string;
  role: string;
  status: "passed" | "warning" | "failed";
  finding: string;
  severity: "low" | "medium" | "high";
};
