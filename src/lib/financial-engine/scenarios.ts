import type { ScenarioConfig } from "@/types/financial";

export const PRESET_SCENARIOS: ScenarioConfig[] = [
  {
    name: "Base Case",
    type: "BASE",
    adjustments: [],
  },
  {
    name: "Best Case - Aggressive Growth",
    type: "BEST_CASE",
    adjustments: [
      { assumptionName: "GROWTH_RATE", multiplier: 1.5 },
      { assumptionName: "GROSS_MARGIN", multiplier: 1.1 },
      { assumptionName: "CHURN_RATE", multiplier: 0.7 },
      { assumptionName: "CUSTOMER_ACQUISITION", multiplier: 0.85 },
    ],
  },
  {
    name: "Worst Case - Market Downturn",
    type: "WORST_CASE",
    adjustments: [
      { assumptionName: "GROWTH_RATE", multiplier: 0.5 },
      { assumptionName: "GROSS_MARGIN", multiplier: 0.85 },
      { assumptionName: "INFLATION", multiplier: 1.5 },
      { assumptionName: "CHURN_RATE", multiplier: 1.8 },
      { assumptionName: "CUSTOMER_ACQUISITION", multiplier: 1.4 },
    ],
  },
  {
    name: "Recession Scenario",
    type: "CUSTOM",
    adjustments: [
      { assumptionName: "GROWTH_RATE", multiplier: 0.3 },
      { assumptionName: "REVENUE", multiplier: 0.7 },
      { assumptionName: "INFLATION", multiplier: 2.0 },
      { assumptionName: "INTEREST_RATE", multiplier: 1.5 },
      { assumptionName: "SALARY", multiplier: 1.1 },
    ],
  },
  {
    name: "High Inflation",
    type: "CUSTOM",
    adjustments: [
      { assumptionName: "INFLATION", multiplier: 2.5 },
      { assumptionName: "SALARY", multiplier: 1.3 },
      { assumptionName: "RENT", multiplier: 1.25 },
      { assumptionName: "SUPPLY_CHAIN", multiplier: 1.4 },
      { assumptionName: "INTEREST_RATE", multiplier: 1.8 },
    ],
  },
];

export function getScenarioByName(name: string): ScenarioConfig | undefined {
  return PRESET_SCENARIOS.find((s) => s.name === name);
}

export function createCustomScenario(
  name: string,
  adjustments: ScenarioConfig["adjustments"]
): ScenarioConfig {
  return { name, type: "CUSTOM", adjustments };
}
