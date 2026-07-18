"use client";

import type { AISuggestion } from "@/types/ai";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatConfidence, generateExplainability } from "@/lib/ai/explainable";
import { useState } from "react";

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onAccept: (id: string) => void;
  onReject: (id: string, feedback: string) => void;
}

export function SuggestionCard({ suggestion, onAccept, onReject }: SuggestionCardProps) {
  const [showExplainability, setShowExplainability] = useState(false);
  const [feedback, setFeedback] = useState("");

  const explainability = generateExplainability(suggestion);
  const confidenceInfo = formatConfidence(suggestion.confidence);

  const typeLabels: Record<string, string> = {
    MARKETING_IDEA: "Marketing",
    BRAND_STRATEGY: "Branding",
    CUSTOMER_ENGAGEMENT: "Engagement",
    FINANCIAL_OPTIMIZATION: "Financial",
    RISK_MITIGATION: "Risk",
    MARKET_OPPORTUNITY: "Opportunity",
    OPERATIONAL_IMPROVEMENT: "Operations",
    COMPLIANCE_ADVICE: "Compliance",
  };

  return (
    <Card variant="bordered" className="relative overflow-hidden">
      {suggestion.isAccepted !== undefined && (
        <div className={`absolute inset-0 opacity-5 ${suggestion.isAccepted ? "bg-green-500" : "bg-red-500"}`} />
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="info">{typeLabels[suggestion.type] || suggestion.type}</Badge>
            <Badge variant={suggestion.confidence > 0.7 ? "success" : suggestion.confidence > 0.5 ? "warning" : "danger"}>
              {confidenceInfo.label}
            </Badge>
          </div>
          <span className="text-xs text-gray-500">{new Date(suggestion.createdAt).toLocaleDateString()}</span>
        </div>
        <CardTitle className="mt-2 text-base">{suggestion.category}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="mb-3 text-sm text-gray-300">{suggestion.content}</p>

        {suggestion.reasoning && (
          <div className="mb-3 rounded-lg bg-black/30 border border-white/10 p-3">
            <p className="mb-1 text-xs font-medium text-gray-400">Why this suggestion?</p>
            <p className="text-xs text-gray-400">{suggestion.reasoning}</p>
          </div>
        )}

        {suggestion.sources && suggestion.sources.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-gray-400">Sources</p>
            <div className="flex flex-wrap gap-1">
              {suggestion.sources.map((source, i) => (
                <Badge key={i} variant="default" size="sm">{source.source}</Badge>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowExplainability(!showExplainability)}
          className="mb-3 text-xs text-blue-400 hover:text-blue-300"
        >
          {showExplainability ? "Hide details" : "Show confidence breakdown"}
        </button>

        {showExplainability && (
          <div className="mb-3 space-y-2 rounded-lg bg-blue-900/20 border border-blue-800/30 p-3">
            <p className="text-xs font-medium text-blue-300">Confidence Breakdown</p>
            {explainability.confidenceBreakdown.map((factor, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-32 text-xs text-gray-300">{factor.factor}</span>
                <div className="flex-1">
                  <div className="h-1.5 w-full rounded-full bg-gray-700">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${factor.score * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400">{(factor.score * 100).toFixed(0)}%</span>
              </div>
            ))}

            {explainability.alternativeOptions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-blue-300">Alternatives</p>
                <ul className="mt-1 space-y-1">
                  {explainability.alternativeOptions.map((alt, i) => (
                    <li key={i} className="text-xs text-gray-400">- {alt}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-2">
              <p className="text-xs font-medium text-blue-300">Risk Assessment</p>
              <p className="text-xs text-gray-400">{explainability.riskAssessment}</p>
            </div>
          </div>
        )}

        {suggestion.isAccepted === undefined && (
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => onAccept(suggestion.id)}>
              Accept
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onReject(suggestion.id, feedback)}>
              Reject
            </Button>
          </div>
        )}

        {suggestion.isAccepted !== undefined && (
          <Badge variant={suggestion.isAccepted ? "success" : "danger"}>
            {suggestion.isAccepted ? "Accepted" : "Rejected"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
