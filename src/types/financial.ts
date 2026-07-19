export interface FinancialProjection {
  id: string;
  period: string;
  periodType: "MONTHLY" | "QUARTERLY" | "YEARLY";
  revenue: number;
  expenses: number;
  netIncome: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  assets: number;
  liabilities: number;
  equity: number;
  details: Record<string, number>;
}

export interface RecalculationInput {
  planId: string;
  assumptions: AssumptionInput[];
  periodRange: {
    start: string;
    end: string;
    type: "MONTHLY" | "QUARTERLY" | "YEARLY";
  };
  scenarios?: ScenarioConfig[];
}

export interface AssumptionInput {
  category: string;
  name: string;
  value: number;
  unit?: string;
  sensitivity?: number; // % change for sensitivity analysis
}

export interface ScenarioConfig {
  name: string;
  type: "BASE" | "BEST_CASE" | "WORST_CASE" | "CUSTOM";
  adjustments: AssumptionAdjustment[];
}

export interface AssumptionAdjustment {
  assumptionName: string;
  multiplier: number; // 1.0 = no change, 1.1 = 10% increase
}

export interface RecalculationResult {
  projections: ProjectionRow[];
  summary: FinancialSummary;
  scenarios: ScenarioResult[];
  sensitivityAnalysis: SensitivityResult[];
  timestamp: number;
}

export interface ProjectionRow {
  period: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: OperatingExpenses;
  ebitda: number;
  depreciation: number;
  interest: number;
  tax: number;
  netIncome: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  balanceSheet: BalanceSheet;
}

export interface OperatingExpenses {
  salaries: number;
  rent: number;
  marketing: number;
  utilities: number;
  insurance: number;
  supplies: number;
  other: number;
  total: number;
}

export interface BalanceSheet {
  currentAssets: number;
  fixedAssets: number;
  totalAssets: number;
  currentLiabilities: number;
  longTermLiabilities: number;
  totalLiabilities: number;
  equity: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
  breakEvenPeriod: string;
  totalFundingRequired: number;
  projectedValuation: number;
  burnRate: number;
  runway: number; // months
}

export interface ScenarioResult {
  name: string;
  type: string;
  summary: FinancialSummary;
  deviationFromBase: number; // % difference
}

export interface SensitivityResult {
  assumption: string;
  impact: SensitivityImpact[];
}

export interface SensitivityImpact {
  changePercent: number;
  resultingMetric: number;
  metricChange: number;
}
