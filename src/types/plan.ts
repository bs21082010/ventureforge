import type { FinancialProjection } from "./financial";

export interface Plan {
  id: string;
  title: string;
  description?: string;
  industry: string;
  region: string;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "CERTIFIED" | "ARCHIVED";
  version: number;
  isPublished: boolean;
  certHash?: string;
  ownerId: string;
  sections: PlanSection[];
  financials: FinancialProjection[];
  assumptions: Assumption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanSection {
  id: string;
  type: SectionType;
  title: string;
  content: Record<string, unknown>;
  order: number;
}

export type SectionType =
  | "EXECUTIVE_SUMMARY"
  | "MARKET_ANALYSIS"
  | "PRODUCT_DESCRIPTION"
  | "MARKETING_STRATEGY"
  | "OPERATIONS_PLAN"
  | "FINANCIAL_PLAN"
  | "RISK_ASSESSMENT"
  | "TEAM_ORGANIZATION"
  | "FUNDING_REQUEST"
  | "IMPLEMENTATION_TIMELINE"
  | "CUSTOM";

export interface Assumption {
  id: string;
  category: AssumptionCategory;
  name: string;
  value: number;
  unit?: string;
  minBound?: number;
  maxBound?: number;
  isDynamic: boolean;
  dataSource?: string;
}

export type AssumptionCategory =
  | "REVENUE"
  | "COST"
  | "INFLATION"
  | "RENT"
  | "SALARY"
  | "SUPPLY_CHAIN"
  | "MARKETING"
  | "TAX"
  | "INTEREST_RATE"
  | "EXCHANGE_RATE"
  | "CUSTOMER_ACQUISITION"
  | "CHURN_RATE";

export interface CreatePlanRequest {
  title: string;
  description?: string;
  industry: string;
  region: string;
}

export interface UpdatePlanRequest {
  title?: string;
  description?: string;
  status?: Plan["status"];
  isPublished?: boolean;
}
