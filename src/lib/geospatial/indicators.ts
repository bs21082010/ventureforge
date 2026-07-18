import type { RegionalIndicator } from "@/types/data";

export interface MarketIndicator {
  name: string;
  value: number;
  trend: "UP" | "DOWN" | "STABLE";
  volatility: number;
  source: string;
  lastUpdated: Date;
}

export function computeMarketHealthScore(indicators: RegionalIndicator[]): number {
  if (indicators.length === 0) return 50;

  let score = 50;

  for (const indicator of indicators) {
    if (indicator.name.includes("GDP")) {
      score += Math.min(indicator.value / 50000, 1) * 15;
    }
    if (indicator.name.includes("Inflation")) {
      score += indicator.value < 4 ? 10 : indicator.value < 7 ? 5 : -5;
    }
    if (indicator.name.includes("Unemployment")) {
      score += indicator.value < 5 ? 10 : indicator.value < 8 ? 0 : -10;
    }
    if (indicator.name.includes("Digital")) {
      score += (indicator.value / 100) * 15;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getIndustryGrowthRate(
  industry: string,
  region: string
): number {
  const baseGrowthRates: Record<string, number> = {
    TECHNOLOGY: 15,
    FINANCE: 8,
    HEALTHCARE: 12,
    EDUCATION: 10,
    RETAIL: 6,
    MANUFACTURING: 5,
    AGRICULTURE: 4,
    REAL_ESTATE: 7,
    TOURISM: 11,
    LOGISTICS: 9,
    ENERGY: 6,
    FOOD_SERVICE: 8,
    ECOMMERCE: 18,
    BIOTECH: 14,
    GAMING: 20,
  };

  const regionMultipliers: Record<string, number> = {
    mumbai: 1.1,
    ambikapur: 0.7,
    dubai: 1.2,
    new_york: 1.0,
    london: 0.95,
    singapore: 1.15,
  };

  const normalizedIndustry = industry.toUpperCase().replace(/\s+/g, "_");
  const baseRate = baseGrowthRates[normalizedIndustry] || 8;
  const multiplier = regionMultipliers[region] || 1.0;

  return baseRate * multiplier;
}

export function getCompetitorDensity(
  industry: string,
  region: string
): "LOW" | "MEDIUM" | "HIGH" | "SATURATED" {
  const densityMap: Record<string, Record<string, string>> = {
    TECHNOLOGY: {
      mumbai: "HIGH",
      dubai: "MEDIUM",
      new_york: "SATURATED",
      london: "HIGH",
      singapore: "HIGH",
      ambikapur: "LOW",
    },
    FINANCE: {
      mumbai: "HIGH",
      dubai: "HIGH",
      new_york: "SATURATED",
      london: "SATURATED",
      singapore: "HIGH",
      ambikapur: "LOW",
    },
    RETAIL: {
      mumbai: "SATURATED",
      dubai: "HIGH",
      new_york: "HIGH",
      london: "HIGH",
      singapore: "MEDIUM",
      ambikapur: "MEDIUM",
    },
  };

  const normalizedIndustry = industry.toUpperCase().replace(/\s+/g, "_");
  const regionMap = densityMap[normalizedIndustry];
  if (!regionMap) return "MEDIUM";

  return (regionMap[region] as "LOW" | "MEDIUM" | "HIGH" | "SATURATED") || "MEDIUM";
}
