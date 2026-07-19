"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MicroscopeIcon, AlertTriangleIcon } from "@/components/ui/icons";
import StudioGuide from "@/components/studio/studio-guide";

const STEPS = [
  { number: 1, title: "Enter a topic", description: "Any market, industry, trend, or business idea you want to analyze." },
  { number: 2, title: "Choose depth", description: "Quick Scan for a fast overview, or Deep Dive for comprehensive analysis with data." },
  { number: 3, title: "Get insights", description: "AI delivers key insights, competitors, trends, risks, and market data." },
];

const INDICATOR_META: Record<string, { label: string; unit: string; prefix: string; format: (v: number) => string }> = {
  "NY.GDP.MKTP.CD": { label: "GDP (Current US$)", unit: "trillion", prefix: "$", format: (v) => `$${(v / 1e12).toFixed(2)}T` },
  "SP.POP.TOTL": { label: "Population", unit: "billion", prefix: "", format: (v) => `${(v / 1e9).toFixed(3)}B` },
  "FP.CPI.TOTL.ZG": { label: "Inflation (CPI %)", unit: "%", prefix: "", format: (v) => `${v.toFixed(2)}%` },
};

const INDICATOR_COLORS: Record<string, string> = {
  "NY.GDP.MKTP.CD": "blue",
  "SP.POP.TOTL": "green",
  "FP.CPI.TOTL.ZG": "yellow",
};

function EconomicDataCard({ data, source }: { data: any; source: string }) {
  if (!data || data.error) return null;
  const rows = data.data || [];
  const grouped: Record<string, any[]> = {};
  for (const r of rows) {
    if (!grouped[r.indicator]) grouped[r.indicator] = [];
    grouped[r.indicator].push(r);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <CardTitle className="text-sm text-gray-100">{source}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(grouped).map(([indicator, items]) => {
              const meta = INDICATOR_META[indicator] || { label: indicator, unit: "", prefix: "", format: (v: number) => v.toLocaleString() };
              const color = INDICATOR_COLORS[indicator] || "blue";
              const sorted = items.sort((a, b) => b.year - a.year);
              const current = sorted[0];
              const previous = sorted[1];
              const change = previous ? ((current.value - previous.value) / previous.value) * 100 : 0;
              const changeColor = indicator === "FP.CPI.TOTL.ZG" ? (change > 0 ? "text-red-400" : "text-green-400") : (change > 0 ? "text-green-400" : "text-red-400");

              return (
                <div key={indicator} className="rounded-lg border border-white/10 bg-black/30 p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{meta.label}</p>
                  <p className="text-2xl font-bold text-white">{meta.format(current.value)}</p>
                  <p className={`text-xs mt-1 ${changeColor}`}>
                    {change > 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}% from {previous?.year || "N/A"}
                  </p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {sorted.map((item) => (
                      <span key={item.year} className={`text-[11px] px-2 py-0.5 rounded-full border border-white/10 text-gray-300`}>
                        {item.year}: {meta.format(item.value)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] text-gray-500">Updated: {new Date(data.timestamp).toLocaleString()}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ResearchHubPage() {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<"quick" | "deep">("quick");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title: string; summary: string; keyInsights: string[]; marketSize: string;
    competitors: { name: string; strength: string; weakness: string }[];
    trends: string[]; risks: string[]; recommendations: string[]; sources: string[];
  } | null>(null);
  const [economicData, setEconomicData] = useState<{ worldBank?: any; fred?: any } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    setEconomicData(null);

    try {
      const [researchRes, dataRes] = await Promise.all([
        fetch("/api/builders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "research", topic, depth }),
        }),
        fetch("/api/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ region: "IN", indicators: ["NY.GDP.MKTP.CD", "SP.POP.TOTL", "FP.CPI.TOTL.ZG"], years: [2022, 2023, 2024] }) }),
      ]);

      const research = await researchRes.json();
      if (!researchRes.ok) {
        setToast(research.error || "Failed to research topic");
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setResult(research);

      const data = await dataRes.json();
      if (data && !data.error) setEconomicData({ worldBank: data });
    } catch {
      setToast("Failed to research topic");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      {toast && <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50">{toast}</div>}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg text-white"><MicroscopeIcon size={24} /></div>
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-[0.2em] font-share-tech-mono">Creation Studio</p>
          <h1 className="text-2xl font-bold text-gray-100">Research Hub</h1>
          <p className="text-sm text-gray-400">Deep-dive into any market, industry, or business idea</p>
        </div>
      </motion.div>

      <StudioGuide steps={STEPS} color="#f59e0b" />

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card animated>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-100">Topic to Research</h2>
            <textarea
              className="w-full min-h-[80px] p-3 rounded-lg border border-gray-300 bg-white text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Electric vehicle market in Southeast Asia"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={depth === "quick" ? "default" : "outline"} onClick={() => setDepth("quick")}>Quick Scan</Button>
              <Button size="sm" variant={depth === "deep" ? "default" : "outline"} onClick={() => setDepth("deep")}>Deep Dive</Button>
              <div className="flex-1 hidden sm:block" />
              <Button onClick={generate} disabled={loading || !topic.trim()} className="sm:ml-auto">
                {loading ? "Researching..." : "Research"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-100">{result.title}</CardTitle>
              <Badge>{result.marketSize}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-gray-300">{result.summary}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm text-gray-100">Key Insights</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1">{result.keyInsights.map((k, i) => <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-blue-400">•</span>{k}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-gray-100">Competitors</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">{result.competitors.map((c, i) => <div key={i} className="text-sm p-2 bg-black/30 border border-white/10 rounded"><p className="font-medium text-gray-200">{c.name}</p><p className="text-green-400 text-xs">Strength: {c.strength}</p><p className="text-red-400 text-xs">Weakness: {c.weakness}</p></div>)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-gray-100">Trends</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1">{result.trends.map((t, i) => <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400">↑</span>{t}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-gray-100">Risks</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1">{result.risks.map((r, i) => <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-red-400"><AlertTriangleIcon size={14} /></span>{r}</li>)}</ul></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm text-gray-100">Recommendations</CardTitle></CardHeader>
            <CardContent><ul className="space-y-2">{result.recommendations.map((r, i) => <li key={i} className="text-sm p-2 bg-blue-900/20 border border-blue-800/30 rounded text-gray-300">{r}</li>)}</ul></CardContent>
          </Card>

          {economicData?.worldBank && (
            <EconomicDataCard data={economicData.worldBank} source="World Bank — Live Economic Indicators" />
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
