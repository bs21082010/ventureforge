import type { WorkflowStep, WorkflowConfig } from "@/types/ai";

export type { WorkflowConfig };

export function createDefaultWorkflow(planId: string): WorkflowConfig {
  return {
    planId,
    steps: [
      {
        id: "ai_draft",
        type: "AI_DRAFT",
        status: "PENDING",
      },
      {
        id: "human_review",
        type: "HUMAN_REVIEW",
        status: "PENDING",
      },
      {
        id: "human_refine",
        type: "HUMAN_REFINE",
        status: "PENDING",
      },
      {
        id: "system_validate",
        type: "SYSTEM_VALIDATE",
        status: "PENDING",
      },
      {
        id: "approve",
        type: "APPROVE",
        status: "PENDING",
      },
    ],
    currentStep: 0,
    status: "ACTIVE",
  };
}

export function advanceWorkflow(config: WorkflowConfig): WorkflowConfig {
  const updatedSteps = [...config.steps];
  const currentIdx = config.currentStep;

  if (currentIdx < updatedSteps.length) {
    updatedSteps[currentIdx] = {
      ...updatedSteps[currentIdx],
      status: "COMPLETED",
      timestamp: new Date(),
    };
  }

  const nextIdx = currentIdx + 1;
  if (nextIdx < updatedSteps.length) {
    updatedSteps[nextIdx] = {
      ...updatedSteps[nextIdx],
      status: "IN_PROGRESS",
    };
  }

  return {
    ...config,
    steps: updatedSteps,
    currentStep: nextIdx,
    status: nextIdx >= updatedSteps.length ? "COMPLETED" : "ACTIVE",
  };
}

export function rejectWorkflowStep(
  config: WorkflowConfig,
  feedback: string
): WorkflowConfig {
  const updatedSteps = [...config.steps];
  const currentIdx = config.currentStep;

  if (currentIdx < updatedSteps.length) {
    updatedSteps[currentIdx] = {
      ...updatedSteps[currentIdx],
      status: "REJECTED",
      feedback,
      timestamp: new Date(),
    };
  }

  return {
    ...config,
    steps: updatedSteps,
    currentStep: Math.max(0, currentIdx - 1),
    status: "REVIEW_NEEDED",
  };
}

export function generateAISectionDraft(
  sectionType: string,
  context: Record<string, unknown>
): string {
  const templates: Record<string, string> = {
    EXECUTIVE_SUMMARY: `This business plan outlines ${context.title || "our venture"}, a ${context.industry || "technology"} company based in ${context.region || "a key market"}. The plan projects strong growth driven by market demand and strategic positioning.`,
    MARKET_ANALYSIS: `The ${context.industry || "target"} industry represents a significant market opportunity. Analysis of ${context.region || "the target region"} shows favorable conditions for market entry, with growing demand and manageable competition.`,
    PRODUCT_DESCRIPTION: `${context.title || "Our product"} addresses a critical need in the ${context.industry || "market"} space. Key differentiators include innovation, quality, and customer-centric design.`,
    MARKETING_STRATEGY: `Our go-to-market strategy focuses on digital-first customer acquisition, leveraging content marketing, strategic partnerships, and community building to drive growth.`,
    OPERATIONS_PLAN: `Operations will be structured for scalability, with cloud-native infrastructure, automated workflows, and a lean team model that grows with demand.`,
    FINANCIAL_PLAN: `Financial projections indicate a path to profitability within 18-24 months, with break-even expected by month 16. Revenue growth is projected at 15-20% year-over-year.`,
    RISK_ASSESSMENT: `Key risks include market competition, regulatory changes, and talent acquisition. Mitigation strategies include diversification, compliance monitoring, and competitive compensation.`,
    TEAM_ORGANIZATION: `The founding team brings complementary expertise in technology, business development, and operations. Key hires will focus on engineering and sales.`,
  };

  return templates[sectionType] || `This section covers the ${sectionType.toLowerCase().replace(/_/g, " ")} aspects of the business plan.`;
}
