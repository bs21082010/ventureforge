import type {
  ForesightRequest,
  ForesightResult,
  Trend,
  Risk,
  Opportunity,
  Forecast,
} from "@/types/ai";
import { getIndustryGrowthRate, getCompetitorDensity } from "../geospatial/indicators";

const MACRO_TRENDS: Trend[] = [
  {
    name: "AI Integration Across Industries",
    direction: "UP",
    impact: 9,
    probability: 0.95,
    timeframe: "2024-2030",
    description: "Generative AI and automation reshaping every business function from customer service to product development.",
    sources: [{ title: "McKinsey Global AI Report 2024", source: "mckinsey" }],
  },
  {
    name: "Sustainability-First Business Models",
    direction: "UP",
    impact: 8,
    probability: 0.9,
    timeframe: "2024-2035",
    description: "ESG compliance and sustainable practices becoming mandatory for market access and investor relations.",
    sources: [{ title: "World Economic Forum 2024", source: "wef" }],
  },
  {
    name: "Decentralized Finance Growth",
    direction: "UP",
    impact: 7,
    probability: 0.75,
    timeframe: "2025-2030",
    description: "Traditional financial services increasingly competing with DeFi solutions for payments, lending, and investment.",
    sources: [{ title: "DeFi Pulse Report", source: "defipulse" }],
  },
  {
    name: "Remote-First Work Culture",
    direction: "STABLE",
    impact: 6,
    probability: 0.85,
    timeframe: "2024-2030",
    description: "Hybrid and remote work models stabilizing as standard across knowledge industries globally.",
    sources: [{ title: "Gartner Future of Work", source: "gartner" }],
  },
  {
    name: "Supply Chain Regionalization",
    direction: "UP",
    impact: 8,
    probability: 0.8,
    timeframe: "2024-2028",
    description: "Companies diversifying supply chains away from single-source dependencies toward regional alternatives.",
    sources: [{ title: "Gartner Supply Chain Report", source: "gartner" }],
  },
];

function generateIndustryTrends(industry: string): Trend[] {
  const specificTrends: Trend[] = [
    {
      name: `${industry} Market Consolidation`,
      direction: "UP",
      impact: 7,
      probability: 0.7,
      timeframe: "2025-2028",
      description: `Expected consolidation phase in the ${industry} sector with larger players acquiring innovative startups.`,
      sources: [],
    },
    {
      name: `Digital Transformation in ${industry}`,
      direction: "UP",
      impact: 8,
      probability: 0.85,
      timeframe: "2024-2030",
      description: `Accelerating digital adoption across ${industry} with focus on automation and data-driven decisions.`,
      sources: [],
    },
  ];

  return specificTrends;
}

function assessRegionalRisks(region: string, industry: string): Risk[] {
  const baseRisks: Risk[] = [
    {
      name: "Regulatory Changes",
      severity: "MEDIUM",
      probability: 0.4,
      impact: "Potential compliance cost increases and operational adjustments",
      mitigation: [
        "Monitor regulatory developments",
        "Build flexible compliance framework",
        "Maintain regulatory counsel relationship",
      ],
    },
    {
      name: "Economic Downturn",
      severity: "HIGH",
      probability: 0.3,
      impact: "Reduced consumer spending, tighter credit, slower growth",
      mitigation: [
        "Build cash reserves (6+ months)",
        "Diversify revenue streams",
        "Develop cost-reduction playbook",
      ],
    },
    {
      name: "Talent Competition",
      severity: "MEDIUM",
      probability: 0.6,
      impact: "Difficulty attracting and retaining key talent, increased labor costs",
      mitigation: [
        "Competitive compensation packages",
        "Remote work flexibility",
        "Invest in training and development",
      ],
    },
  ];

  if (region === "india" || region === "mumbai" || region === "ambikapur") {
    baseRisks.push({
      name: "Infrastructure Challenges",
      severity: "MEDIUM",
      probability: 0.5,
      impact: "Power outages, connectivity issues, logistics delays",
      mitigation: [
        "Invest in backup power systems",
        "Use cloud-based infrastructure",
        "Establish multiple logistics partners",
      ],
    });
  }

  return baseRisks;
}

function identifyOpportunities(
  industry: string,
  region: string
): Opportunity[] {
  const opportunities: Opportunity[] = [
    {
      name: "Emerging Market Expansion",
      potential: "HIGH",
      timeframe: "12-24 months",
      requirements: ["Market research", "Local partnerships", "Adapted pricing"],
      expectedReturn: "2-5x revenue growth in target segments",
    },
    {
      name: "Technology Partnership",
      potential: "MEDIUM",
      timeframe: "6-12 months",
      requirements: ["Technical integration capability", "API infrastructure"],
      expectedReturn: "30-50% efficiency improvement",
    },
  ];

  const density = getCompetitorDensity(industry, region);
  if (density === "LOW") {
    opportunities.push({
      name: "First-Mover Advantage",
      potential: "HIGH",
      timeframe: "6-18 months",
      requirements: ["Speed to market", "Brand building", "Customer acquisition"],
      expectedReturn: "Market leadership position with 20-30% market share potential",
    });
  }

  return opportunities;
}

function generateForecasts(
  industry: string,
  region: string,
  timeframe: number
): Forecast[] {
  const growthRate = getIndustryGrowthRate(industry, region);

  return [
    {
      metric: "Market Size Growth",
      current: 100,
      predicted: 100 * Math.pow(1 + growthRate / 100, timeframe),
      confidence: 0.7,
      factors: ["Industry growth rate", "Regional adoption", "Competitive dynamics"],
    },
    {
      metric: "Customer Acquisition Cost",
      current: 100,
      predicted: 100 * Math.pow(0.95, timeframe),
      confidence: 0.6,
      factors: ["Marketing efficiency", "Brand awareness", "Channel optimization"],
    },
    {
      metric: "Average Revenue Per User",
      current: 100,
      predicted: 100 * Math.pow(1 + (growthRate * 0.3) / 100, timeframe),
      confidence: 0.65,
      factors: ["Pricing power", "Value perception", "Feature expansion"],
    },
  ];
}

export async function generateForesight(
  request: ForesightRequest
): Promise<ForesightResult> {
  const trends = [...MACRO_TRENDS, ...generateIndustryTrends(request.industry)];
  const risks = assessRegionalRisks(request.region, request.industry);
  const opportunities = identifyOpportunities(request.industry, request.region);
  const forecasts = generateForecasts(
    request.industry,
    request.region,
    request.timeframe
  );

  return {
    trends,
    risks,
    opportunities,
    forecasts,
    confidence: 0.72,
  };
}
