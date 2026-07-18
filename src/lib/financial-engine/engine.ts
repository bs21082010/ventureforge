import type {
  RecalculationInput,
  RecalculationResult,
  ProjectionRow,
  FinancialSummary,
  ScenarioResult,
  SensitivityResult,
  OperatingExpenses,
  BalanceSheet,
} from "@/types/financial";
import type { Assumption } from "@/types/plan";

const DEFAULT_ASSUMPTIONS: Record<string, number> = {
  INFLATION: 0.03,
  TAX_RATE: 0.25,
  INTEREST_RATE: 0.05,
  GROWTH_RATE: 0.15,
  GROSS_MARGIN: 0.60,
  OPERATING_MARGIN: 0.20,
  CUSTOMER_ACQUISITION_COST: 50,
  CUSTOMER_LIFETIME_VALUE: 500,
  CHURN_RATE: 0.05,
  DEPRECIATION_RATE: 0.10,
};

function getAssumptionValue(
  assumptions: Assumption[],
  name: string,
  fallback?: number
): number {
  const found = assumptions.find(
    (a) => a.name === name || a.category === name
  );
  return found ? found.value : (fallback ?? DEFAULT_ASSUMPTIONS[name] ?? 0);
}

function generatePeriods(
  start: string,
  end: string,
  type: "MONTHLY" | "QUARTERLY" | "YEARLY"
): string[] {
  const periods: string[] = [];
  const startYear = parseInt(start.split("-")[0]);
  const startMonth = parseInt(start.split("-")[1] || "1");
  const endYear = parseInt(end.split("-")[0]);
  const endMonth = parseInt(end.split("-")[1] || "12");

  let currentYear = startYear;
  let currentMonth = startMonth;

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    if (type === "MONTHLY") {
      periods.push(
        `${currentYear}-${String(currentMonth).padStart(2, "0")}`
      );
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    } else if (type === "QUARTERLY") {
      const quarter = Math.ceil(currentMonth / 3);
      periods.push(`${currentYear}-Q${quarter}`);
      currentMonth += 3;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    } else {
      periods.push(`${currentYear}`);
      currentYear++;
    }
  }

  return periods;
}

function calculateOperatingExpenses(
  revenue: number,
  assumptions: Assumption[]
): OperatingExpenses {
  const salaryCost =
    revenue * getAssumptionValue(assumptions, "SALARY", 0.30);
  const rentCost = getAssumptionValue(assumptions, "RENT", 5000);
  const marketingCost =
    revenue * getAssumptionValue(assumptions, "MARKETING", 0.10);
  const utilitiesCost = rentCost * 0.15;
  const insuranceCost = rentCost * 0.05;
  const suppliesCost = revenue * 0.02;
  const otherCost = revenue * 0.03;
  const total =
    salaryCost +
    rentCost +
    marketingCost +
    utilitiesCost +
    insuranceCost +
    suppliesCost +
    otherCost;

  return {
    salaries: salaryCost,
    rent: rentCost,
    marketing: marketingCost,
    utilities: utilitiesCost,
    insurance: insuranceCost,
    supplies: suppliesCost,
    other: otherCost,
    total,
  };
}

function calculateBalanceSheet(
  previousBalance: BalanceSheet | null,
  netIncome: number,
  revenue: number,
  assumptions: Assumption[]
): BalanceSheet {
  const depreciationRate = getAssumptionValue(
    assumptions,
    "DEPRECIATION_RATE",
    0.10
  );
  const fixedAssets = previousBalance
    ? previousBalance.fixedAssets * (1 - depreciationRate) + revenue * 0.05
    : revenue * 2;
  const currentAssets = previousBalance
    ? previousBalance.currentAssets + netIncome * 0.3
    : revenue * 0.5;
  const totalAssets = currentAssets + fixedAssets;

  const currentLiabilities = previousBalance
    ? previousBalance.currentLiabilities * 0.95 + revenue * 0.02
    : revenue * 0.3;
  const longTermLiabilities = previousBalance
    ? previousBalance.longTermLiabilities * 0.98
    : revenue * 1.0;
  const totalLiabilities = currentLiabilities + longTermLiabilities;
  const equity = totalAssets - totalLiabilities;

  return {
    currentAssets,
    fixedAssets,
    totalAssets,
    currentLiabilities,
    longTermLiabilities,
    totalLiabilities,
    equity,
  };
}

function applyScenarioAdjustments(
  baseValue: number,
  adjustments: { assumptionName: string; multiplier: number }[],
  assumptionName: string
): number {
  const adjustment = adjustments.find(
    (a) => a.assumptionName === assumptionName
  );
  return adjustment ? baseValue * adjustment.multiplier : baseValue;
}

export function recalculate(input: RecalculationInput): RecalculationResult {
  const periods = generatePeriods(
    input.periodRange.start,
    input.periodRange.end,
    input.periodRange.type
  );

  const projections: ProjectionRow[] = [];
  let cumulativeCashFlow = 0;
  let previousBalance: BalanceSheet | null = null;

  const revenueGrowth = getAssumptionValue(
    input.assumptions as Assumption[],
    "GROWTH_RATE",
    0.15
  );
  const grossMargin = getAssumptionValue(
    input.assumptions as Assumption[],
    "GROSS_MARGIN",
    0.60
  );
  const taxRate = getAssumptionValue(
    input.assumptions as Assumption[],
    "TAX_RATE",
    0.25
  );
  const interestRate = getAssumptionValue(
    input.assumptions as Assumption[],
    "INTEREST_RATE",
    0.05
  );

  let baseRevenue = getAssumptionValue(
    input.assumptions as Assumption[],
    "REVENUE",
    100000
  );

  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    const revenue =
      baseRevenue * Math.pow(1 + revenueGrowth, i);
    const cogs = revenue * (1 - grossMargin);
    const grossProfit = revenue - cogs;
    const opex = calculateOperatingExpenses(
      revenue,
      input.assumptions as Assumption[]
    );
    const ebitda = grossProfit - opex.total;
    const depreciation = revenue * getAssumptionValue(
      input.assumptions as Assumption[],
      "DEPRECIATION_RATE",
      0.10
    );
    const interest = (previousBalance?.longTermLiabilities || 0) * interestRate;
    const earningsBeforeTax = ebitda - depreciation - interest;
    const tax = Math.max(0, earningsBeforeTax * taxRate);
    const netIncome = earningsBeforeTax - tax;
    const cashFlow = netIncome + depreciation;
    cumulativeCashFlow += cashFlow;

    const balanceSheet = calculateBalanceSheet(
      previousBalance,
      netIncome,
      revenue,
      input.assumptions as Assumption[]
    );

    projections.push({
      period,
      revenue,
      cogs,
      grossProfit,
      operatingExpenses: opex,
      ebitda,
      depreciation,
      interest,
      tax,
      netIncome,
      cashFlow,
      cumulativeCashFlow,
      balanceSheet,
    });

    previousBalance = balanceSheet;
  }

  const summary = calculateSummary(projections);
  const scenarios = calculateScenarios(input);
  const sensitivityAnalysis = calculateSensitivity(input);

  return {
    projections,
    summary,
    scenarios,
    sensitivityAnalysis,
    timestamp: Date.now(),
  };
}

function calculateSummary(projections: ProjectionRow[]): FinancialSummary {
  const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0);
  const totalExpenses = projections.reduce(
    (sum, p) => sum + p.cogs + p.operatingExpenses.total + p.tax + p.interest,
    0
  );
  const netProfit = projections.reduce((sum, p) => sum + p.netIncome, 0);
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const breakEven = projections.find((p) => p.cumulativeCashFlow >= 0);
  const breakEvenPeriod = breakEven ? breakEven.period : "N/A";

  const initialInvestment = Math.abs(
    Math.min(0, projections[0]?.cashFlow || 0) * 3
  );
  const roi =
    initialInvestment > 0
      ? (netProfit / initialInvestment) * 100
      : 0;

  const lastProjection = projections[projections.length - 1];
  const projectedValuation = lastProjection
    ? lastProjection.netIncome * 15
    : 0;

  const avgMonthlyRevenue = totalRevenue / (projections.length || 1);
  const avgMonthlyExpenses = totalExpenses / (projections.length || 1);
  const burnRate = Math.max(0, avgMonthlyExpenses - avgMonthlyRevenue);
  const monthlyCashFlow =
    projections.length > 0
      ? projections.reduce((sum, p) => sum + p.cashFlow, 0) / projections.length
      : 0;
  const runway = monthlyCashFlow > 0 ? Infinity : burnRate > 0 ? (initialInvestment / burnRate) : Infinity;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    roi,
    breakEvenPeriod,
    totalFundingRequired: initialInvestment,
    projectedValuation,
    burnRate,
    runway: runway === Infinity ? 999 : Math.floor(runway),
  };
}

function calculateScenarios(input: RecalculationInput): ScenarioResult[] {
  if (!input.scenarios || input.scenarios.length === 0) return [];

  const baseResult = recalculate({
    ...input,
    scenarios: undefined,
  });

  return input.scenarios.map((scenario) => {
    const adjustedAssumptions = input.assumptions.map((a) => ({
      ...a,
      value: applyScenarioAdjustments(
        a.value,
        scenario.adjustments,
        a.name
      ),
    }));

    const scenarioResult = recalculate({
      ...input,
      assumptions: adjustedAssumptions,
      scenarios: undefined,
    });

    const deviationFromBase =
      baseResult.summary.totalRevenue > 0
        ? ((scenarioResult.summary.totalRevenue - baseResult.summary.totalRevenue) /
            baseResult.summary.totalRevenue) *
          100
        : 0;

    return {
      name: scenario.name,
      type: scenario.type,
      summary: scenarioResult.summary,
      deviationFromBase,
    };
  });
}

function calculateSensitivity(
  input: RecalculationInput
): SensitivityResult[] {
  const keyAssumptions = ["REVENUE", "GROWTH_RATE", "GROSS_MARGIN", "TAX_RATE"];
  const changes = [-20, -10, -5, 5, 10, 20];

  const baseResult = recalculate({
    ...input,
    scenarios: undefined,
  });

  return keyAssumptions.map((assumptionName) => ({
    assumption: assumptionName,
    impact: changes.map((changePercent) => {
      const adjustedAssumptions = input.assumptions.map((a) =>
        a.name === assumptionName || a.category === assumptionName
          ? { ...a, value: a.value * (1 + changePercent / 100) }
          : a
      );

      const result = recalculate({
        ...input,
        assumptions: adjustedAssumptions,
        scenarios: undefined,
      });

      return {
        changePercent,
        resultingMetric: result.summary.netProfit,
        metricChange:
          baseResult.summary.netProfit !== 0
            ? ((result.summary.netProfit - baseResult.summary.netProfit) /
                Math.abs(baseResult.summary.netProfit)) *
              100
            : 0,
      };
    }),
  }));
}
