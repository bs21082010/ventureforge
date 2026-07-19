"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REGIONS, getUniqueCountries, getStatesForCountry, getCitiesForState } from "@/lib/geospatial/regions";

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Manufacturing", "Agriculture", "Real Estate", "Tourism", "Logistics",
  "Energy", "Food Service", "E-Commerce", "Biotech", "Gaming",
];

export default function NewPlanPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const countries = useMemo(() => getUniqueCountries(), []);
  const states = useMemo(() => country ? getStatesForCountry(country) : [], [country]);
  const cities = useMemo(() => country && state ? getCitiesForState(country, state) : [], [country, state]);

  const regionId = cities.find(c => c.id === city)?.id || "";

  const handleCreate = async () => {
    if (!title || !industry || !regionId) return;
    setLoading(true);
    showToast("Forge is generating your business plan...", "info");

    const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Save to localStorage immediately so it shows in Plans list
    const localPlan = {
      id: planId,
      title,
      description,
      industry,
      region: city || regionId,
      status: "DRAFT",
      version: 1,
      createdAt: new Date().toISOString(),
      sections: [
        { type: "EXECUTIVE_SUMMARY", title: "Executive Summary", content: { text: "" }, order: 0 },
        { type: "MARKET_ANALYSIS", title: "Market Analysis", content: { text: "" }, order: 1 },
        { type: "PRODUCT_DESCRIPTION", title: "Product Description", content: { text: "" }, order: 2 },
        { type: "MARKETING_STRATEGY", title: "Marketing Strategy", content: { text: "" }, order: 3 },
        { type: "OPERATIONS_PLAN", title: "Operations Plan", content: { text: "" }, order: 4 },
        { type: "FINANCIAL_PLAN", title: "Financial Plan", content: { text: "" }, order: 5 },
        { type: "RISK_ASSESSMENT", title: "Risk Assessment", content: { text: "" }, order: 6 },
        { type: "TEAM_ORGANIZATION", title: "Team & Organization", content: { text: "" }, order: 7 },
      ],
    };

    try {
      // Try API first
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, industry, region: regionId }),
      });
      const data = await response.json();
      if (data.plan) {
        // API worked - save to localStorage too
        const apiPlan = {
          ...data.plan,
          createdAt: data.plan.createdAt || new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem("vf_plans") || "[]");
        existing.unshift(apiPlan);
        localStorage.setItem("vf_plans", JSON.stringify(existing));
        showToast("Business plan created successfully!", "success");
        router.push(`/plans/${data.plan.id}`);
        return;
      }
    } catch {}

    // API failed - use localStorage plan with AI sections
    showToast("Forge is generating content...", "info");
    try {
      const aiResponse = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          message: `Write a complete business plan for "${title}" in the ${industry} industry located in ${city || regionId}. Include these 8 sections with detailed, specific content for each:\n\n1. EXECUTIVE_SUMMARY: Mission, value proposition, target market, financial highlights\n2. MARKET_ANALYSIS: Market size, growth trends, competitors, opportunity\n3. PRODUCT_DESCRIPTION: What the product does, features, tech stack, differentiators\n4. MARKETING_STRATEGY: Channels, acquisition, branding, pricing, growth tactics\n5. OPERATIONS_PLAN: Daily ops, infrastructure, processes, scaling\n6. FINANCIAL_PLAN: Revenue model, costs, funding, projections\n7. RISK_ASSESSMENT: 5-7 risks with mitigations\n8. TEAM_ORGANIZATION: Roles, structure, culture, hiring plan`,
          history: [],
        }),
      });
      const aiData = await aiResponse.json();
      const fullText = aiData.response || "";

      // Parse sections from AI response
      const sectionPatterns = [
        { type: "EXECUTIVE_SUMMARY", regex: /(?:executive summary|overview)[:\s]*([\s\S]*?)(?=\d\.?\s*(?:market analysis|market overview|MARKET)|$)/i },
        { type: "MARKET_ANALYSIS", regex: /(?:market analysis|market overview|market opportunity)[:\s]*([\s\S]*?)(?=\d\.?\s*(?:product|PRODUCT)|$)/i },
        { type: "PRODUCT_DESCRIPTION", regex: /(?:product description|product overview|our product)[:\s]*([\s\S]*?)(?=\d\.?\s*(?:marketing|MARKETING)|$)/i },
        { type: "MARKETING_STRATEGY", regex: /(?:marketing strategy|go.to.market)[:\s]*([\s\S]*?)(?=\d\.?\s*(?:operations|OPERATIONS)|$)/i },
        { type: "OPERATIONS_PLAN", regex: /(?:operations plan|operations)[:\s]*([\s\S]*?)(?=\d\.?\s*(?:financial|FINANCIAL)|$)/i },
        { type: "FINANCIAL_PLAN", regex: /(?:financial plan|financials)[:\s]*([\s\S]*?)(?=\d\.?\s*(?:risk|RISK)|$)/i },
        { type: "RISK_ASSESSMENT", regex: /(?:risk assessment|risks)[:\s]*([\s\S]*?)(?=\d\.?\s*(?:team|TEAM)|$)/i },
        { type: "TEAM_ORGANIZATION", regex: /(?:team|organization|team & organization)[:\s]*([\s\S]*?)$/i },
      ];

      const sections = localPlan.sections.map((s, i) => {
        const pattern = sectionPatterns[i];
        const match = fullText.match(pattern?.regex || /$/);
        const text = match?.[1]?.trim() || fullText.slice(i * Math.floor(fullText.length / 8), (i + 1) * Math.floor(fullText.length / 8)).trim();
        return { ...s, content: { text } };
      });

      localPlan.sections = sections;
    } catch {
      // AI failed, use empty sections
    }

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("vf_plans") || "[]");
    existing.unshift(localPlan);
    localStorage.setItem("vf_plans", JSON.stringify(existing));

    showToast("Business plan created!", "success");
    router.push(`/plans/${planId}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
          toast.type === "success" ? "bg-green-600" : toast.type === "info" ? "bg-blue-600" : "bg-red-600"
        }`}>{toast.msg}</div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Create New Business Plan</h1>
        <p className="text-sm text-gray-400">Set up your plan with regional context for Forge-powered insights</p>
      </div>

      <Card variant="bordered">
        <CardContent className="space-y-6">
          <Input
            label="Business Plan Title"
            placeholder="e.g., TechVenture - AI Analytics Platform"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white text-black px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Brief description of your business concept..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Industry</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <Button
                  key={ind}
                  variant={industry === ind ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setIndustry(ind)}
                >
                  {ind}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">Location</label>
            <p className="text-xs text-gray-500">Plans adapt to local economic conditions, regulations, and market dynamics.</p>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Country</label>
                <select
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setState(""); setCity(""); }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">State</label>
                <select
                  value={state}
                  onChange={(e) => { setState(e.target.value); setCity(""); }}
                  disabled={!country}
                  className="w-full rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!state}
                  className="w-full rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {city && (
              <div className="rounded-lg border border-blue-800/30 bg-blue-900/20 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs">
                  <div><span className="text-gray-400">Currency:</span> <span className="text-gray-200">{REGIONS.find(r => r.id === city)?.currency}</span></div>
                  <div><span className="text-gray-400">Language:</span> <span className="text-gray-200">{REGIONS.find(r => r.id === city)?.language}</span></div>
                  <div><span className="text-gray-400">Market:</span> <span className="text-gray-200">{REGIONS.find(r => r.id === city)?.economicProfile.marketSize}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleCreate} disabled={loading || !title || !industry || !regionId}>
              {loading ? "Creating..." : "Create Business Plan"}
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
