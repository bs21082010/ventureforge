"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreativityWorkspace } from "@/components/ai/creativity-workspace";
import type { ForesightResult, Trend, Risk, Opportunity } from "@/types/ai";

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing",
  "Agriculture", "Real Estate", "Energy", "Automotive", "Food & Beverage",
  "Telecommunications", "Media & Entertainment", "Logistics & Supply Chain",
  "Aerospace & Defense", "Pharmaceuticals", "Insurance",
  "Consulting & Professional Services", "Hospitality & Tourism",
  "Mining & Metals", "Sports & Fitness", "Legal Services", "Construction",
  "Water & Utilities",
];

export default function AISandboxPage() {
  const [activeTab, setActiveTab] = useState<"creativity" | "foresight">("creativity");
  const [foresight, setForesight] = useState<ForesightResult | null>(null);
  const [foresightLoading, setForesightLoading] = useState(false);
  const [industry, setIndustry] = useState("Technology");
  const [region, setRegion] = useState("mumbai");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const generateForesight = async () => {
    setForesightLoading(true);
    showToast("Generating predictive foresight...");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "foresight", industry, region, timeframe: 5 }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to generate foresight");
        return;
      }
      setForesight(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to generate foresight");
    } finally {
      setForesightLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">AI Sandbox</h1>
        <p className="text-sm text-gray-400">AI-powered creativity and predictive foresight</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === "creativity" ? "primary" : "outline"}
          onClick={() => setActiveTab("creativity")}
        >
          Creativity Sandbox
        </Button>
        <Button
          variant={activeTab === "foresight" ? "primary" : "outline"}
          onClick={() => setActiveTab("foresight")}
        >
          Predictive Foresight
        </Button>
      </div>

      {activeTab === "creativity" && <CreativityWorkspace />}

      {activeTab === "foresight" && (
        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Predictive Foresight Engine</CardTitle>
              <p className="text-sm text-gray-500">
                AI models trained on macroeconomic trends to forecast risks and opportunities.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-300">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-300">Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="mumbai">Mumbai, India</option>
                    <option value="dubai">Dubai, UAE</option>
                    <option value="new_york">New York, USA</option>
                    <option value="london">London, UK</option>
                    <option value="singapore">Singapore</option>
                    <option value="ambikapur">Ambikapur, India</option>
                  </select>
                </div>
                <Button variant="primary" onClick={generateForesight} disabled={foresightLoading} className="w-full sm:w-auto">
                  {foresightLoading ? "Analyzing..." : "Generate Foresight"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {foresight && (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card variant="bordered">
                  <CardHeader>
                    <CardTitle className="text-base">Trends</CardTitle>
                    <Badge variant="info">{foresight.trends.length} identified</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {foresight.trends.slice(0, 5).map((t, i) => (
                        <TrendItem key={i} trend={t} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card variant="bordered">
                  <CardHeader>
                    <CardTitle className="text-base">Risks</CardTitle>
                    <Badge variant="danger">{foresight.risks.length} identified</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {foresight.risks.map((r, i) => (
                        <RiskItem key={i} risk={r} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card variant="bordered">
                  <CardHeader>
                    <CardTitle className="text-base">Opportunities</CardTitle>
                    <Badge variant="success">{foresight.opportunities.length} identified</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {foresight.opportunities.map((o, i) => (
                        <OpportunityItem key={i} opportunity={o} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {foresight.forecasts.length > 0 && (
                <Card variant="bordered">
                  <CardHeader>
                    <CardTitle>5-Year Forecasts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {foresight.forecasts.map((f, i) => (
                        <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-4">
                          <p className="text-sm font-medium text-gray-200">{f.metric}</p>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-lg font-bold text-gray-400">{f.current}</span>
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                            <span className="text-lg font-bold text-blue-400">{f.predicted.toFixed(0)}</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {(f.confidence * 100).toFixed(0)}% confidence
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TrendItem({ trend }: { trend: Trend }) {
  const dirColors = { UP: "text-green-400", DOWN: "text-red-400", STABLE: "text-blue-400", VOLATILE: "text-yellow-400" };
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-200">{trend.name}</p>
        <div className="flex gap-1">
          <Badge variant={trend.impact >= 8 ? "danger" : trend.impact >= 5 ? "warning" : "info"} size="sm">
            Impact {trend.impact}/10
          </Badge>
        </div>
      </div>
      <p className="text-xs text-gray-400">{trend.timeframe} - {(trend.probability * 100).toFixed(0)}% probability</p>
      <p className="mt-1 text-xs text-gray-400">{trend.description}</p>
    </div>
  );
}

function RiskItem({ risk }: { risk: Risk }) {
  const sevColors: Record<string, "success" | "warning" | "danger" | "info"> = {
    LOW: "info", MEDIUM: "warning", HIGH: "danger", CRITICAL: "danger",
  };
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-200">{risk.name}</p>
        <Badge variant={sevColors[risk.severity]} size="sm">{risk.severity}</Badge>
      </div>
      <p className="mt-1 text-xs text-gray-400">{risk.impact}</p>
      <div className="mt-2">
        <p className="text-xs font-medium text-gray-400">Mitigation:</p>
        {risk.mitigation.map((m, i) => (
          <p key={i} className="text-xs text-gray-400">- {m}</p>
        ))}
      </div>
    </div>
  );
}

function OpportunityItem({ opportunity }: { opportunity: Opportunity }) {
  const potColors: Record<string, "success" | "warning" | "info"> = { LOW: "info", MEDIUM: "warning", HIGH: "success" };
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-200">{opportunity.name}</p>
        <Badge variant={potColors[opportunity.potential]} size="sm">{opportunity.potential}</Badge>
      </div>
      <p className="mt-1 text-xs text-gray-400">Timeframe: {opportunity.timeframe}</p>
      <p className="text-xs text-green-400">{opportunity.expectedReturn}</p>
      <div className="mt-1">
        {opportunity.requirements.map((r, i) => (
          <span key={i} className="mr-1 inline-block rounded bg-black/40 backdrop-blur-xl border border-white/10 px-1.5 py-0.5 text-[10px] text-gray-400">{r}</span>
        ))}
      </div>
    </div>
  );
}
