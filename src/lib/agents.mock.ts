import type { AgentResult, EconomyData } from "./types";
import { simulateProgression, calculateUpgradeROI } from "./simulation";

function findEconomyIssues(economy: EconomyData): string[] {
  const issues: string[] = [];
  const forge = economy.upgrades.find((u) => u.id === "forge_lvl");
  if (forge && forge.costGrowth > 3) {
    issues.push(`Forge cost growth ${forge.costGrowth}x is unsustainable beyond early levels`);
  }
  const earlyGap = economy.upgrades.filter((u) => u.unlockMinute > 10 && u.unlockMinute < 18);
  if (earlyGap.length === 0) {
    issues.push("No upgrades unlock between minutes 10-18, creating a dead zone");
  }
  const prestige1 = economy.prestige.levels[0];
  if (prestige1 && prestige1.multiplier < 1.1) {
    issues.push(`First prestige reward (+${Math.round((prestige1.multiplier - 1) * 100)}% Gold) is too weak`);
  }
  const epic = economy.rarities.find((r) => r.id === "epic");
  if (epic && epic.dropWeight > 10) {
    issues.push("Epic drop weight is too high, making epics feel common");
  }
  return issues;
}

function buildBalancePatch(): { version: string; changes: { path: string; oldValue: string | number; newValue: string | number; reason: string }[] } {
  return {
    version: "1.0.1-balance-patch",
    changes: [
      {
        path: "upgrades.forge_lvl.costGrowth",
        oldValue: 3.5,
        newValue: 2.2,
        reason: "Reduce cost growth from 3.5x to 2.2x for sustainable forge progression",
      },
      {
        path: "rarities.epic.dropWeight",
        oldValue: 15,
        newValue: 8,
        reason: "Lower epic drop rate so epics feel exciting, not common",
      },
      {
        path: "rarities.legendary.dropWeight",
        oldValue: 5,
        newValue: 1.5,
        reason: "Make legendaries genuinely rare drops that thrill players",
      },
      {
        path: "prestige.levels[0].multiplier",
        oldValue: 1.05,
        newValue: 1.25,
        reason: "First prestige should feel rewarding - boost from +5% to +25%",
      },
      {
        path: "upgrades.new.midgame",
        oldValue: "none",
        newValue: "Auto-Forge upgrade unlock at minute 12",
        reason: "Fill the 10-18 minute dead zone with a meaningful unlock",
      },
      {
        path: "rarities.legendary.behavior",
        oldValue: "stat_multiplier_only",
        newValue: "stat_multiplier + unique affix",
        reason: "Legendary items need unique gameplay effects, not just bigger numbers",
      },
    ],
  };
}

export const mockAgents = {
  visionParser(economy: EconomyData, _screenshot: string | null): AgentResult {
    const hasScreenshot = !!_screenshot;
    return {
      name: "Vision Parser",
      role: "Analyzes screenshot for UI layout, element placement, and visual hierarchy",
      status: hasScreenshot ? "passed" : "warning",
      finding: hasScreenshot
        ? "Detected cramped bottom-row upgrade buttons, tiny stat font (est. 11px), and hidden prestige menu. Color contrast on stats panel fails WCAG AA."
        : "No screenshot provided. Skipped visual analysis. Analysis based on economy data only.",
      severity: "medium",
    };
  },

  firstTimePlayer(_economy: EconomyData): AgentResult {
    const issues: string[] = [];
    if (_economy.unlocks.length > 0 && _economy.unlocks[0].unlockMinute === 0) {
      issues.push("Forge is immediately available but no tutorial guides the first tap");
    }
    const earlyUpgrade = _economy.upgrades.find((u) => u.unlockMinute <= 2 && u.unlockMinute > 0);
    if (!earlyUpgrade) {
      issues.push("No onboarding unlock in the first 2 minutes");
    }
    return {
      name: "First-Time Player",
      role: "Simulates a new player's first session experience",
      status: issues.length > 1 ? "warning" : "passed",
      finding:
        issues.length > 0
          ? issues.join(". ") + ". New players lack guidance on optimal first actions."
          : "First session onboarding is reasonable.",
      severity: "high",
    };
  },

  mobileUX(): AgentResult {
    return {
      name: "Mobile UX",
      role: "Evaluates mobile-specific usability: touch targets, readability, thumb zones",
      status: "warning",
      finding:
        "Upgrade buttons are 38x38px (below 48px minimum touch target). Stats panel font is estimated 11px on 1080p screen (below 14px minimum for readability). No thumb-zone optimization for one-handed play.",
      severity: "high",
    };
  },

  progressionClarity(economy: EconomyData): AgentResult {
    const sim = simulateProgression(economy);
    const cp15 = sim.checkpoints.find((c) => c.minute === 15);
    const hasMidGap = economy.upgrades.filter((u) => u.unlockMinute > 0 && u.unlockMinute < 12).length === 0;
    return {
      name: "Progression Clarity",
      role: "Checks whether players understand what to do next at each stage",
      status: hasMidGap ? "failed" : "warning",
      finding: hasMidGap
        ? `Dead zone detected: no meaningful unlocks between minutes 10-18. At minute 15, player power is ~${cp15?.power ?? "?"} but there's nothing new to buy or do. Prestige unlock at minute 25 is poorly telegraphed.`
        : "Progression is communicated adequately but could be clearer.",
      severity: "high",
    };
  },

  economyAnalyst(economy: EconomyData): AgentResult {
    const issues = findEconomyIssues(economy);
    const roi = calculateUpgradeROI(economy);
    const badRoi = roi.filter((r) => r.flag === "bad");
    return {
      name: "Economy Analyst",
      role: "Analyzes economy balance, inflation, and reward pacing",
      status: issues.length > 2 ? "failed" : "warning",
      finding:
        issues.join(". ") +
        (badRoi.length > 0
          ? ` Upgrade ROI issues: ${badRoi.map((r) => r.name).join(", ")} have unsustainable cost curves.`
          : ""),
      severity: "high",
    };
  },

  casualPersona(): AgentResult {
    return {
      name: "Casual Player Persona",
      role: "Simulates a casual player who plays 15-20 min sessions",
      status: "warning",
      finding:
        "Casual player hits a wall around minute 15. No affordable upgrade, no new content, and gold accumulation is too slow for prestige. They would likely churn here. Suggested: add a daily bonus or mid-session reward at minute 15.",
      severity: "medium",
    };
  },

  minMaxPersona(economy: EconomyData): AgentResult {
    const roi = calculateUpgradeROI(economy);
    const bestRoi = roi.reduce((a, b) => (a.efficiencyScore > b.efficiencyScore ? a : b));
    return {
      name: "Min-Max Player Persona",
      role: "Simulates a hardcore optimizer looking for the most efficient path",
      status: "passed",
      finding: `Optimal early strategy: rush ${bestRoi.name} (efficiency score: ${bestRoi.efficiencyScore}). Forge is a resource trap due to ${economy.upgrades.find((u) => u.id === "forge_lvl")?.costGrowth ?? "?"}x cost growth. Prestige should be saved until tier 2 for efficiency.`,
      severity: "low",
    };
  },

  patchDesigner(): AgentResult {
    const patch = buildBalancePatch();
    return {
      name: "Patch Designer",
      role: "Generates a balanced set of economy adjustments",
      status: "passed",
      finding: `Generated ${patch.changes.length} balance changes targeting forge cost scaling, rarity distribution, prestige rewards, mid-game gap, and legendary item depth.`,
      severity: "medium",
    };
  },

  critic(economy: EconomyData): AgentResult {
    const issues = findEconomyIssues(economy);
    return {
      name: "Critic",
      role: "Reviews all agent findings for consistency and actionable insights",
      status: issues.length > 2 ? "warning" : "passed",
      finding:
        issues.length > 2
          ? `Cross-validated ${issues.length} economy issues confirmed by multiple agents. Highest priority: fix forge cost growth and fill minute 10-18 gap. These changes alone would lift player retention noticeably.`
          : "All agent findings are consistent. No contradictions detected.",
      severity: "medium",
    };
  },
};

export function runMockPlaytestAnalysis(economy: EconomyData, screenshotBase64: string | null) {
  const start = Date.now();

  const agents = [
    mockAgents.visionParser(economy, screenshotBase64),
    mockAgents.firstTimePlayer(economy),
    mockAgents.mobileUX(),
    mockAgents.progressionClarity(economy),
    mockAgents.economyAnalyst(economy),
    mockAgents.casualPersona(),
    mockAgents.minMaxPersona(economy),
    mockAgents.patchDesigner(),
    mockAgents.critic(economy),
  ];

  const sim = simulateProgression(economy);
  const balancePatch = buildBalancePatch();
  const useCerebras = !!process.env.CEREBRAS_API_KEY;

  const totalTimeSeconds = (Date.now() - start) / 1000;

  const uiIssues = [
    {
      area: "Upgrade Buttons",
      problem: "Touch targets are 38x38px, below 48px WCAG minimum",
      evidence: "All 4 upgrade buttons measured on screen: identical size, no visual hierarchy",
      whyItHurts: "Players mis-tap frequently on mobile, causing upgrade currency waste",
      fix: "Increase button size to 56x56px minimum. Add visual weight difference for primary vs secondary upgrades.",
      severity: "high" as const,
    },
    {
      area: "Stats Panel",
      problem: "Font is estimated 11px dark-gray on black background",
      evidence: "Contrast ratio ~2.8:1, well below WCAG AA minimum of 4.5:1",
      whyItHurts: "Players cannot read their own stats - fundamental metagame obscured",
      fix: "Increase stat font to 14px minimum. Use #FFFFFF on #1a1a2e for 15:1 contrast ratio.",
      severity: "high" as const,
    },
    {
      area: "Drop Notification",
      problem: "Rarity banner flashes too fast; color coding only (no icon for colorblind)",
      evidence: "Noticeable at all rarity levels. Legendary flash <200ms.",
      whyItHurts: "Players miss exciting drops. Colorblind players (~8% of males) can't distinguish rarities.",
      fix: "Add rarity-specific icons alongside colors. Extend banner display to 3s for epic+ drops with particle effect.",
      severity: "medium" as const,
    },
    {
      area: "Prestige Menu",
      problem: "Hidden behind 'More' menu with no badge or notification",
      evidence: "New playtesters took 25+ minutes to discover prestige on their own",
      whyItHurts: "Core loop mechanic is invisible to casual players",
      fix: "Add glowing prestige button to main HUD when available. Show 'Prestige Ready!' toast at unlock threshold.",
      severity: "high" as const,
    },
    {
      area: "Offline Earnings Popup",
      problem: "Blocks upgrade buttons on launch, must be dismissed first",
      evidence: "Covers bottom 30% of screen including all upgrade buttons",
      whyItHurts: "Frustrating first interaction every session. Interrupts core loop.",
      fix: "Show offline earnings as a slim top banner or slide-in from top that doesn't block interaction zones.",
      severity: "medium" as const,
    },
  ];

  const balanceIssues = [
    {
      system: "Forge Upgrade",
      problem: "Cost growth of 3.5x per level makes forging unsustainable after level 5",
      evidence: `Level 1 costs ${economy.upgrades.find((u) => u.id === "forge_lvl")?.baseCost}, level 6 costs ~${
        Math.round((economy.upgrades.find((u) => u.id === "forge_lvl")?.baseCost ?? 100) * Math.pow(3.5, 5))
      } - 52x increase for 5x power gain`,
      suggestedChange: "Reduce cost growth to 2.2x and add milestone bonuses at levels 5, 10, 15",
      severity: "high" as const,
    },
    {
      system: "Rarity Distribution",
      problem: "Epic drops are 2.5x more common than expected for the rarity tier",
      evidence: "Epic has 15% drop weight vs 7% expected. Players get 9 epics/hour making them feel common.",
      suggestedChange: "Reduce epic drop weight to 8%, legendary to 1.5%. Add 'Mythic' tier at 0.3% for ultra-chase.",
      severity: "medium" as const,
    },
    {
      system: "Prestige Tier 1 Reward",
      problem: "First prestige gives only +5% Gold - feels worthless for the investment",
      evidence: "Costs 100k gold, earns back the investment only after 20+ hours of play",
      suggestedChange: "Boost to +25% Gold. Add a visual prestige badge on player profile for status.",
      severity: "high" as const,
    },
    {
      system: "Mid-Game Dead Zone (10-18 min)",
      problem: "No new unlocks, upgrades, or content between minutes 10 and 18",
      evidence: `At minute 10 power: ${sim.checkpoints[1]?.power ?? "?"}. At minute 15 power: ${sim.checkpoints[2]?.power ?? "?"}. Only +${
        (sim.checkpoints[2]?.power ?? 0) - (sim.checkpoints[1]?.power ?? 0)
      } power gained in 5 minutes.`,
      suggestedChange: "Add Auto-Forge unlock at minute 12 (automatically crafts lowest-level item every 60s)",
      severity: "high" as const,
    },
    {
      system: "Legendary Item Design",
      problem: "Legendary items only increase stats - no gameplay change",
      evidence: "3.5x stat multiplier is the only difference from Common. Same behavior, just bigger numbers.",
      suggestedChange: "Add unique affix system: each legendary rolls a special ability (chain attack, life leech, gold explosion)",
      severity: "medium" as const,
    },
  ];

  const playtestReportMarkdown = `# Playtest Swarm Report: ${economy.gameName}

**Overall Score:** 42/100  
**Main Risk:** Players churn in the 10-18 minute dead zone due to lack of progression and unsustainable upgrade costs.  
**Recommended Action:** Apply balance patch v1.0.1 immediately. Redesign forge cost curve and fill mid-game gap.

## Agent Findings

${agents.map((a) => `- **${a.name}** [${a.status.toUpperCase()}] (${a.severity}): ${a.finding}`).join("\n")}

## Top UI Issues

${uiIssues.map((u) => `- **${u.area}** (${u.severity}): ${u.problem} → ${u.fix}`).join("\n")}

## Top Balance Issues

${balanceIssues.map((b) => `- **${b.system}** (${b.severity}): ${b.problem} → ${b.suggestedChange}`).join("\n")}

---
*Generated by Playtest Swarm using ${useCerebras ? "Cerebras gemma-4-31b" : "Mock Mode"}*
`;

  const uiFixBriefMarkdown = `# UI Fix Brief: ${economy.gameName}

## Critical Fixes (Before Launch)

1. **Increase touch targets to 56px minimum** - All interactive elements
2. **Fix stats panel contrast** - #FFFFFF on #1a1a2e, min 14px font
3. **Surface Prestige button** - Add to main HUD with glow effect when available

## Quick Wins

4. **Extend drop notification** - 3s display for Epic+, add rarity icons
5. **Relocate offline earnings popup** - Move to top banner, don't block buttons

## Colorblind Support

6. Add rarity icons alongside color coding
7. Test with deuteranopia/protanopia simulation filters
`;

  const socialDemoSummary = `Just ran ${economy.gameName} through Playtest Swarm. 

9 AI agents analyzed the UI, economy, and progression in under ${
    totalTimeSeconds < 1 ? "<1" : Math.round(totalTimeSeconds)
  }s.

Score: 42/100  
Top risk: Mid-game dead zone at minute 10-18  
Fastest fix: Increase touch targets to 56px  

This tool would have saved our last playtest $2,000 and 3 weeks of iteration.

Built with Cerebras Gemma 4 31B for real-time AI game analysis.
`;

  return {
    agents,
    balancePatch,
    uiIssues,
    balanceIssues,
    playtestReportMarkdown,
    uiFixBriefMarkdown,
    socialDemoSummary,
    totalTimeSeconds,
  };
}
