import { create } from "zustand";
import type {
  RecalculationResult,
  RecalculationInput,
  ScenarioConfig,
  FinancialProjection,
} from "@/types/financial";
import type { Assumption } from "@/types/plan";
import { recalculate } from "@/lib/financial-engine/engine";

interface FinancialState {
  result: RecalculationResult | null;
  isCalculating: boolean;
  activeScenarios: ScenarioConfig[];
  periodRange: { start: string; end: string; type: "MONTHLY" | "QUARTERLY" | "YEARLY" };

  recalculate: (assumptions: Assumption[]) => void;
  setPeriodRange: (range: Partial<FinancialState["periodRange"]>) => void;
  addScenario: (scenario: ScenarioConfig) => void;
  removeScenario: (name: string) => void;
  getProjections: () => FinancialProjection[];
  getSummary: () => RecalculationResult["summary"] | null;
}

export const useFinancialStore = create<FinancialState>((set, get) => ({
  result: null,
  isCalculating: false,
  activeScenarios: [
    { name: "Base Case", type: "BASE", adjustments: [] },
    { name: "Best Case", type: "BEST_CASE", adjustments: [
      { assumptionName: "GROWTH_RATE", multiplier: 1.5 },
      { assumptionName: "GROSS_MARGIN", multiplier: 1.1 },
    ]},
    { name: "Worst Case", type: "WORST_CASE", adjustments: [
      { assumptionName: "GROWTH_RATE", multiplier: 0.5 },
      { assumptionName: "INFLATION", multiplier: 1.5 },
    ]},
  ],
  periodRange: {
    start: "2025-01",
    end: "2027-12",
    type: "MONTHLY",
  },

  recalculate: (assumptions) => {
    set({ isCalculating: true });

    const state = get();
    const input: RecalculationInput = {
      planId: "current",
      assumptions: assumptions.map((a) => ({
        category: a.category,
        name: a.name,
        value: a.value,
        unit: a.unit,
      })),
      periodRange: state.periodRange,
      scenarios: state.activeScenarios,
    };

    try {
      const result = recalculate(input);
      set({ result, isCalculating: false });
    } catch (error) {
      console.error("Recalculation error:", error);
      set({ isCalculating: false });
    }
  },

  setPeriodRange: (range) =>
    set((state) => ({
      periodRange: { ...state.periodRange, ...range },
    })),

  addScenario: (scenario) =>
    set((state) => ({
      activeScenarios: [...state.activeScenarios, scenario],
    })),

  removeScenario: (name) =>
    set((state) => ({
      activeScenarios: state.activeScenarios.filter((s) => s.name !== name),
    })),

  getProjections: () => {
    const { result } = get();
    if (!result) return [];

    return result.projections.map((p) => ({
      id: p.period,
      period: p.period,
      periodType: "MONTHLY" as const,
      revenue: p.revenue,
      expenses: p.cogs + p.operatingExpenses.total + p.interest,
      netIncome: p.netIncome,
      cashFlow: p.cashFlow,
      assets: p.balanceSheet.totalAssets,
      liabilities: p.balanceSheet.totalLiabilities,
      equity: p.balanceSheet.equity,
      details: {
        cogs: p.cogs,
        grossProfit: p.grossProfit,
        ebitda: p.ebitda,
        depreciation: p.depreciation,
        tax: p.tax,
        interest: p.interest,
      },
    }));
  },

  getSummary: () => {
    const { result } = get();
    return result?.summary || null;
  },
}));
