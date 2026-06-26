import type { EconomyData, SimResult, RoiResult, DropResult, PatchDiff } from "./types";

export function simulateProgression(economy: EconomyData): SimResult {
  const checkpoints = [5, 10, 15, 30, 60];
  const result: SimResult = { checkpoints: [], upgradesBought: [] };

  let power = 10;
  let currency = 0;
  let prestigeLevel = 0;
  let goldPerMin = 50;

  for (let minute = 1; minute <= 60; minute++) {
    currency += goldPerMin * (prestigeLevel > 0 ? economy.prestige.levels[prestigeLevel - 1].multiplier : 1);

    for (const upgrade of economy.upgrades) {
      if (minute >= upgrade.unlockMinute && currency >= upgrade.baseCost) {
        const level = Math.floor(currency / upgrade.baseCost);
        if (level > 0) {
          currency -= upgrade.baseCost * level;
          power += upgrade.powerGain * level;
          result.upgradesBought.push(upgrade.id);
          goldPerMin += upgrade.powerGain * 2;
        }
      }
    }

    if (minute >= 25 && currency >= economy.prestige.levels[0].cost && prestigeLevel === 0) {
      currency -= economy.prestige.levels[0].cost;
      prestigeLevel = 1;
      power *= 1.05;
    }
    if (minute >= 45 && currency >= economy.prestige.levels[1].cost && prestigeLevel === 1) {
      currency -= economy.prestige.levels[1].cost;
      prestigeLevel = 2;
      power *= 1.15;
    }

    if (checkpoints.includes(minute)) {
      result.checkpoints.push({
        minute,
        power: Math.round(power),
        currency: Math.round(currency),
        prestigeLevel,
      });
    }
  }

  return result;
}

export function calculateUpgradeROI(economy: EconomyData): RoiResult {
  return economy.upgrades.map((upgrade) => {
    const levels = 10;
    let costToMax = 0;
    for (let lvl = 1; lvl <= levels; lvl++) {
      costToMax += upgrade.baseCost * Math.pow(upgrade.costGrowth, lvl - 1);
    }
    const powerAtMax = upgrade.powerGain * levels;
    const efficiencyScore = powerAtMax / (costToMax / 1000);

    let flag: "good" | "warning" | "bad";
    if (efficiencyScore > 2) flag = "good";
    else if (efficiencyScore > 0.5) flag = "warning";
    else flag = "bad";

    return {
      id: upgrade.id,
      name: upgrade.name,
      costToMax: Math.round(costToMax),
      powerAtMax,
      efficiencyScore: Math.round(efficiencyScore * 100) / 100,
      flag,
    };
  });
}

export function estimateDropPacing(economy: EconomyData): DropResult {
  const totalWeight = economy.rarities.reduce((sum, r) => sum + r.dropWeight, 0);
  const dropsPerHour = 60;

  return economy.rarities.map((rarity) => {
    const prob = rarity.dropWeight / totalWeight;
    const expected = Math.round(prob * dropsPerHour * 10) / 10;

    let effectiveExcitement: "common-feel" | "exciting" | "rare-feel";
    let issue: string | undefined;

    if (rarity.id === "common" || rarity.id === "rare") {
      effectiveExcitement = "common-feel";
    } else if (rarity.id === "epic" && expected > 8) {
      effectiveExcitement = "common-feel";
      issue = `Epic drops at ${expected}/hour - too common. Players will desensitize.`;
    } else if (rarity.id === "legendary" && expected > 3) {
      effectiveExcitement = "common-feel";
      issue = `Legendary drops at ${expected}/hour - loses prestige. Should feel rare.`;
    } else if (expected < 0.5) {
      effectiveExcitement = "rare-feel";
    } else {
      effectiveExcitement = "exciting";
    }

    return {
      rarityId: rarity.id,
      rarityName: rarity.name,
      expectedDropsPerHour: expected,
      effectiveExcitement,
      issue,
    };
  });
}

export function compareBeforeAfter(
  economy: EconomyData,
  patch: { changes: { path: string; oldValue: string | number; newValue: string | number; reason: string }[] }
): PatchDiff {
  return patch.changes.map((change) => ({
    path: change.path,
    before: change.oldValue,
    after: change.newValue,
    reason: change.reason,
  }));
}
