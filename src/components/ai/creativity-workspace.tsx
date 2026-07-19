"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreativityRequest, CreativityResult, CreativeIdea } from "@/types/ai";

export function CreativityWorkspace() {
  const [request, setRequest] = useState<CreativityRequest>({
    planId: "",
    type: "MARKETING",
    context: "",
    targetAudience: "",
    tone: "professional",
  });
  const [result, setResult] = useState<CreativityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!request.context) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "creativity", ...request }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        console.error("AI error:", data.error || "Unknown error");
        return;
      }
      setResult(data);
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>AI Creativity Sandbox</CardTitle>
          <p className="text-sm text-gray-500">
            Generate marketing, branding, and customer engagement ideas powered by AI.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["MARKETING", "BRANDING", "CUSTOMER_ENGAGEMENT", "CONTENT", "NAMING"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={request.type === type ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setRequest({ ...request, type })}
                  >
                    {type.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>

              <Input
                label="Business Context"
                placeholder="e.g., Organic food delivery startup in Mumbai"
                value={request.context}
                onChange={(e) => setRequest({ ...request, context: e.target.value })}
              />

              <Input
                label="Target Audience"
                placeholder="e.g., Health-conscious urban professionals, 25-40"
                value={request.targetAudience || ""}
                onChange={(e) => setRequest({ ...request, targetAudience: e.target.value })}
              />

              <Input
                label="Tone"
                placeholder="e.g., Professional, playful, authoritative"
                value={request.tone || ""}
                onChange={(e) => setRequest({ ...request, tone: e.target.value })}
              />

              <Button variant="primary" onClick={handleGenerate} disabled={loading || !request.context}>
                {loading ? "Generating..." : "Generate Ideas"}
              </Button>
            </div>

            {result && (
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-100">Creative Ideas</h4>
                  <div className="space-y-3">
                    {result.ideas.map((idea, i) => (
                      <IdeaCard key={i} idea={idea} />
                    ))}
                  </div>
                </div>

                {result.taglines && result.taglines.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-100">Taglines</h4>
                    <div className="space-y-1">
                      {result.taglines.map((tagline, i) => (
                        <div key={i} className="rounded-lg bg-purple-900/20 border border-purple-800/30 px-3 py-2 text-sm text-purple-300">
                          &ldquo;{tagline}&rdquo;
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.nameSuggestions && result.nameSuggestions.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-100">Name Suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.nameSuggestions.map((name, i) => (
                        <Badge key={i} variant="purple">{name}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.visualSuggestions && result.visualSuggestions.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-100">Visual Direction</h4>
                    <ul className="space-y-1">
                      {result.visualSuggestions.map((s, i) => (
                        <li key={i} className="text-xs text-gray-400">- {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IdeaCard({ idea }: { idea: CreativeIdea }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="mb-1 flex items-center justify-between">
        <h5 className="text-sm font-medium text-gray-200">{idea.title}</h5>
        <div className="flex gap-1">
          <Badge variant={idea.estimatedImpact === "HIGH" ? "success" : idea.estimatedImpact === "MEDIUM" ? "warning" : "default"} size="sm">
            {idea.estimatedImpact} impact
          </Badge>
          <Badge variant={idea.estimatedCost === "HIGH" ? "danger" : idea.estimatedCost === "MEDIUM" ? "warning" : "success"} size="sm">
            {idea.estimatedCost} cost
          </Badge>
        </div>
      </div>
      <p className="mb-2 text-xs text-gray-400">{idea.description}</p>
      <div className="flex flex-wrap gap-1">
        {idea.channels.map((ch, i) => (
          <Badge key={i} variant="default" size="sm">{ch}</Badge>
        ))}
      </div>
      {idea.implementationSteps.length > 0 && (
        <div className="mt-2 border-t border-white/10 pt-2">
          <p className="mb-1 text-xs font-medium text-gray-400">Next Steps</p>
          <ol className="space-y-0.5">
            {idea.implementationSteps.map((step, i) => (
              <li key={i} className="text-xs text-gray-400">{i + 1}. {step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
