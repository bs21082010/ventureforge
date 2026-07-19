import { aiChat, aiJsonCompletion, isAnyAI } from "./ai-client";
import { generateMarketingIdeas } from "./creativity-sandbox";
import { generateForesight } from "./foresight";
import { generateExplainability, rankSuggestions } from "./explainable";
import type {
  CreativityRequest,
  CreativityResult,
  ForesightRequest,
  ForesightResult,
  ExplainabilityResult,
  AISuggestion,
} from "@/types/ai";

async function tryAIFallback<T>(
  fn: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  if (!(await isAnyAI())) return fallback();
  try {
    return await fn();
  } catch {
    return fallback();
  }
}

export async function generateBusinessIdeas(
  industry: string,
  region: string,
  count: number
): Promise<CreativityResult> {
  return tryAIFallback(
    async () => {
      const systemPrompt = `You are a senior business strategist and creative director specializing in ${industry} businesses in the ${region} market. 
You have deep expertise in marketing, branding, and customer engagement strategies across global markets.
Generate actionable, specific, and innovative business ideas grounded in current market realities.
Always respond with valid JSON only — no markdown, no commentary.`;

      const userPrompt = `Generate ${count} distinct business/marketing ideas for a ${industry} company operating in ${region}.
For each idea provide:
- title: a concise name
- description: 2-3 sentences explaining the idea
- channels: array of marketing/distribution channels
- estimatedImpact: "LOW" | "MEDIUM" | "HIGH"
- estimatedCost: "LOW" | "MEDIUM" | "HIGH"
- implementationSteps: array of 3-5 concrete steps

Return as JSON: { "ideas": [...], "taglines": [...], "visualSuggestions": [...], "nameSuggestions": [...] }`;

      return aiJsonCompletion<CreativityResult>(systemPrompt, userPrompt, {
        temperature: 0.8,
      });
    },
    () =>
      generateMarketingIdeas({
        planId: "",
        type: "MARKETING",
        context: industry,
        targetAudience: region,
      })
  );
}

export async function generatePredictions(
  assumptions: string[],
  horizon: number
): Promise<ForesightResult> {
  return tryAIFallback(
    async () => {
      const systemPrompt = `You are a senior market analyst and futurist specializing in trend analysis, risk assessment, and forecasting.
You provide data-driven predictions with realistic confidence intervals and probabilities.
Always respond with valid JSON only — no markdown, no commentary.`;

      const userPrompt = `Based on these assumptions and factors: ${assumptions.join("; ")}
Provide a ${horizon}-year market foresight analysis.

Return JSON with this exact structure:
{
  "trends": [{ "name": "...", "direction": "UP"|"DOWN"|"STABLE"|"VOLATILE", "impact": 1-10, "probability": 0-1, "timeframe": "...", "description": "...", "sources": [{ "title": "...", "source": "..." }] }],
  "risks": [{ "name": "...", "severity": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "probability": 0-1, "impact": "...", "mitigation": ["..."] }],
  "opportunities": [{ "name": "...", "potential": "LOW"|"MEDIUM"|"HIGH", "timeframe": "...", "requirements": ["..."], "expectedReturn": "..." }],
  "forecasts": [{ "metric": "...", "current": 100, "predicted": number, "confidence": 0-1, "factors": ["..."] }],
  "confidence": 0-1
}`;

      return aiJsonCompletion<ForesightResult>(systemPrompt, userPrompt, {
        temperature: 0.6,
      });
    },
    () =>
      generateForesight({
        industry: "Technology",
        region: "global",
        timeframe: horizon,
        factors: assumptions,
      })
  );
}

export async function explainDecision(
  decisionType: string,
  inputs: Record<string, unknown>
): Promise<ExplainabilityResult> {
  return tryAIFallback(
    async () => {
      const systemPrompt = `You are an expert explainable AI system that provides transparent, well-reasoned explanations for business decisions.
You break down confidence into measurable factors and provide clear reasoning chains.
Always respond with valid JSON only — no markdown, no commentary.`;

      const userPrompt = `Explain and justify this business decision:
Decision type: ${decisionType}
Inputs: ${JSON.stringify(inputs)}

Return JSON:
{
  "suggestion": "the recommendation",
  "confidence": 0-1,
  "confidenceBreakdown": [{ "factor": "...", "weight": 0-1, "score": 0-1, "explanation": "..." }],
  "sources": [{ "title": "...", "source": "..." }],
  "reasoning": ["step 1...", "step 2..."],
  "alternativeOptions": ["option A...", "option B...", "option C..."],
  "riskAssessment": "..."
}`;

      return aiJsonCompletion<ExplainabilityResult>(systemPrompt, userPrompt, {
        temperature: 0.4,
      });
    },
    () => {
      const fallbackSuggestion: AISuggestion = {
        id: "fallback",
        type: decisionType as AISuggestion["type"],
        category: decisionType,
        content: JSON.stringify(inputs),
        confidence: 0.5,
        sources: [],
        reasoning: "Fallback — API request failed",
        createdAt: new Date(),
      };
      return Promise.resolve(generateExplainability(fallbackSuggestion));
    }
  );
}
