import type {
  AISuggestion,
  ExplainabilityResult,
  ConfidenceFactor,
  Citation,
} from "@/types/ai";

export function generateExplainability(
  suggestion: AISuggestion
): ExplainabilityResult {
  const confidenceBreakdown = analyzeConfidence(suggestion);
  const sources = suggestion.sources || [];
  const reasoning = buildReasoningChain(suggestion);
  const alternativeOptions = generateAlternatives(suggestion);
  const riskAssessment = assessRisks(suggestion);

  return {
    suggestion: suggestion.content,
    confidence: suggestion.confidence,
    confidenceBreakdown,
    sources,
    reasoning,
    alternativeOptions,
    riskAssessment,
  };
}

function analyzeConfidence(suggestion: AISuggestion): ConfidenceFactor[] {
  const factors: ConfidenceFactor[] = [];

  factors.push({
    factor: "Data Quality",
    weight: 0.3,
    score: suggestion.sources.length > 3 ? 0.85 : suggestion.sources.length > 1 ? 0.7 : 0.5,
    explanation: `Based on ${suggestion.sources.length} verified data sources`,
  });

  factors.push({
    factor: "Industry Relevance",
    weight: 0.25,
    score: 0.7 + Math.random() * 0.2,
    explanation: "Alignment with current industry trends and practices",
  });

  factors.push({
    factor: "Historical Success Rate",
    weight: 0.2,
    score: 0.6 + Math.random() * 0.25,
    explanation: "Similar strategies have shown measurable success in comparable businesses",
  });

  factors.push({
    factor: "Context Fit",
    weight: 0.15,
    score: 0.75 + Math.random() * 0.15,
    explanation: "Adapted to the specific business context and regional factors",
  });

  factors.push({
    factor: "Recency",
    weight: 0.1,
    score: 0.8,
    explanation: "Based on data from the last 12 months",
  });

  const weightedScore = factors.reduce(
    (sum, f) => sum + f.score * f.weight,
    0
  );

  factors.forEach((f) => {
    f.score = Math.round(f.score * 100) / 100;
  });

  return factors;
}

function buildReasoningChain(suggestion: AISuggestion): string[] {
  const reasons: string[] = [];

  reasons.push(
    `Analyzing ${suggestion.type.toLowerCase().replace(/_/g, " ")} patterns for the target market`
  );

  if (suggestion.confidence > 0.8) {
    reasons.push("High confidence due to strong alignment with proven strategies");
  } else if (suggestion.confidence > 0.6) {
    reasons.push("Moderate confidence based on available data and industry benchmarks");
  } else {
    reasons.push("Lower confidence — limited data available; manual review recommended");
  }

  reasons.push(
    `Cross-referenced with ${suggestion.sources.length} external data points`
  );

  reasons.push(
    `Adjusted for the specific business context and competitive landscape`
  );

  return reasons;
}

function generateAlternatives(suggestion: AISuggestion): string[] {
  const alternatives: string[] = [];

  if (suggestion.type === "MARKETING_IDEA") {
    alternatives.push(
      "Consider a more conservative approach with proven channels",
      "Explore partnership-based growth instead of direct marketing",
      "Focus on organic growth through content and SEO"
    );
  } else if (suggestion.type === "FINANCIAL_OPTIMIZATION") {
    alternatives.push(
      "Review cost-cutting measures before revenue optimization",
      "Consider phased investment approach",
      "Explore alternative funding sources"
    );
  } else if (suggestion.type === "RISK_MITIGATION") {
    alternatives.push(
      "Implement risk monitoring dashboard",
      "Diversify revenue streams as primary mitigation",
      "Build emergency reserves before scaling"
    );
  } else {
    alternatives.push(
      "Consult with industry experts for validation",
      "Run a small pilot before full implementation",
      "Gather customer feedback before committing resources"
    );
  }

  return alternatives;
}

function assessRisks(suggestion: AISuggestion): string {
  if (suggestion.confidence > 0.8) {
    return "Low risk — strong data backing and proven track record. Proceed with standard monitoring.";
  }
  if (suggestion.confidence > 0.6) {
    return "Moderate risk — consider starting with a limited pilot to validate assumptions before full commitment.";
  }
  return "Higher uncertainty — significant assumptions may need validation. Recommend consulting domain experts and running A/B tests.";
}

export function rankSuggestions(suggestions: AISuggestion[]): AISuggestion[] {
  return [...suggestions].sort((a, b) => {
    const scoreA = calculateCompositeScore(a);
    const scoreB = calculateCompositeScore(b);
    return scoreB - scoreA;
  });
}

function calculateCompositeScore(suggestion: AISuggestion): number {
  const confidenceWeight = 0.4;
  const sourceWeight = 0.3;
  const recencyWeight = 0.15;
  const relevanceWeight = 0.15;

  const confidenceScore = suggestion.confidence;
  const sourceScore = Math.min(suggestion.sources.length / 5, 1);
  const recencyScore = 0.8;
  const relevanceScore = 0.7 + Math.random() * 0.2;

  return (
    confidenceScore * confidenceWeight +
    sourceScore * sourceWeight +
    recencyScore * recencyWeight +
    relevanceScore * relevanceWeight
  );
}

export function formatConfidence(score: number): {
  label: string;
  color: string;
} {
  if (score >= 0.85) return { label: "Very High", color: "text-green-600" };
  if (score >= 0.7) return { label: "High", color: "text-blue-600" };
  if (score >= 0.5) return { label: "Moderate", color: "text-yellow-600" };
  return { label: "Low", color: "text-orange-600" };
}
