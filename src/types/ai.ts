export interface AISuggestion {
  id: string;
  type: AISuggestionType;
  category: string;
  content: string;
  confidence: number;
  sources: Citation[];
  reasoning: string;
  isAccepted?: boolean;
  feedback?: string;
  createdAt: Date;
}

export type AISuggestionType =
  | "MARKETING_IDEA"
  | "BRAND_STRATEGY"
  | "CUSTOMER_ENGAGEMENT"
  | "FINANCIAL_OPTIMIZATION"
  | "RISK_MITIGATION"
  | "MARKET_OPPORTUNITY"
  | "OPERATIONAL_IMPROVEMENT"
  | "COMPLIANCE_ADVICE";

export interface Citation {
  title: string;
  url?: string;
  source: string;
  date?: string;
  excerpt?: string;
}

export interface ExplainabilityResult {
  suggestion: string;
  confidence: number;
  confidenceBreakdown: ConfidenceFactor[];
  sources: Citation[];
  reasoning: string[];
  alternativeOptions: string[];
  riskAssessment: string;
}

export interface ConfidenceFactor {
  factor: string;
  weight: number;
  score: number;
  explanation: string;
}

export interface CreativityRequest {
  planId: string;
  type: "MARKETING" | "BRANDING" | "CUSTOMER_ENGAGEMENT" | "CONTENT" | "NAMING";
  context: string;
  constraints?: string[];
  tone?: string;
  targetAudience?: string;
}

export interface CreativityResult {
  ideas: CreativeIdea[];
  visualSuggestions?: string[];
  taglines?: string[];
  nameSuggestions?: string[];
}

export interface CreativeIdea {
  title: string;
  description: string;
  channels: string[];
  estimatedImpact: "LOW" | "MEDIUM" | "HIGH";
  estimatedCost: "LOW" | "MEDIUM" | "HIGH";
  implementationSteps: string[];
}

export interface ForesightRequest {
  industry: string;
  region: string;
  timeframe: number; // years
  factors: string[];
}

export interface ForesightResult {
  trends: Trend[];
  risks: Risk[];
  opportunities: Opportunity[];
  forecasts: Forecast[];
  confidence: number;
}

export interface Trend {
  name: string;
  direction: "UP" | "DOWN" | "STABLE" | "VOLATILE";
  impact: number; // 1-10
  probability: number;
  timeframe: string;
  description: string;
  sources: Citation[];
}

export interface Risk {
  name: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  probability: number;
  impact: string;
  mitigation: string[];
}

export interface Opportunity {
  name: string;
  potential: "LOW" | "MEDIUM" | "HIGH";
  timeframe: string;
  requirements: string[];
  expectedReturn: string;
}

export interface Forecast {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  factors: string[];
}

export interface WorkflowStep {
  id: string;
  type: "AI_DRAFT" | "HUMAN_REVIEW" | "HUMAN_REFINE" | "SYSTEM_VALIDATE" | "APPROVE";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  assignee?: string;
  input?: string;
  output?: string;
  feedback?: string;
  timestamp?: Date;
}

export interface WorkflowConfig {
  planId: string;
  steps: WorkflowStep[];
  currentStep: number;
  status: "ACTIVE" | "COMPLETED" | "REVIEW_NEEDED";
}
