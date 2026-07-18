"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RocketIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StudioGuide from "@/components/studio/studio-guide";

const STEPS = [
  { number: 1, title: "Describe your idea", description: "Enter your business idea, industry, and whether you need a website or app." },
  { number: 2, title: "AI builds your bundle", description: "Generates a complete business plan with sections, timeline, and cost estimates." },
  { number: 3, title: "Optional: website & app", description: "If selected, AI generates a website and/or mobile app to go with your plan." },
];

export default function BusinessBuilderPage() {
  const [idea, setIdea] = useState("");
  const [industry, setIndustry] = useState("");
  const [includeWebsite, setIncludeWebsite] = useState(false);
  const [includeApp, setIncludeApp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    businessPlan: { summary: string; sections: { title: string; content: string }[] };
    websiteCode?: string; appCode?: string;
    techStack: string[]; timeline: string; estimatedCosts: { item: string; cost: string }[];
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const generate = async () => {
    if (!idea.trim() || !industry.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "business", idea, industry, includeWebsite, includeApp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Failed to generate business bundle");
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setResult(data);
    } catch {
      setToast("Failed to generate business bundle");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      {toast && <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50">{toast}</div>}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center shadow-lg text-white"><RocketIcon size={24} /></div>
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-[0.2em] font-share-tech-mono">Creation Studio</p>
          <h1 className="text-2xl font-bold text-gray-100">Business Builder</h1>
          <p className="text-sm text-gray-400">Business plan + optional website + app — all in one</p>
        </div>
      </motion.div>

      <StudioGuide steps={STEPS} color="#ef4444" />

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card animated>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-100">Describe Your Business</h2>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 bg-white text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's your business idea?"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <input
              className="w-full p-3 rounded-lg border border-gray-300 bg-white text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Industry (e.g., 'Health Tech', 'E-commerce')"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-300">
                <input type="checkbox" checked={includeWebsite} onChange={(e) => setIncludeWebsite(e.target.checked)} className="w-4 h-4" />
                Include Website
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-300">
                <input type="checkbox" checked={includeApp} onChange={(e) => setIncludeApp(e.target.checked)} className="w-4 h-4" />
                Include Mobile App
              </label>
            </div>
            <Button onClick={generate} disabled={loading || !idea.trim() || !industry.trim()} className="w-full">
              {loading ? "Generating..." : "Generate Business Bundle"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Business Plan</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  {result.techStack.map((t) => <Badge key={t} variant="info">{t}</Badge>)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed mb-4 text-gray-300">{result.businessPlan.summary}</p>
              <div className="space-y-3">
                {result.businessPlan.sections.map((s, i) => (
                  <div key={i} className="p-3 bg-black/30 border border-white/10 rounded-lg">
                    <h4 className="font-medium text-sm mb-1 text-gray-200">{s.title}</h4>
                    <p className="text-xs text-gray-400">{s.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Timeline</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-300">{result.timeline}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Estimated Costs</CardTitle></CardHeader>
              <CardContent><div className="space-y-1">{result.estimatedCosts.map((c, i) => <div key={i} className="flex justify-between text-sm text-gray-300"><span>{c.item}</span><span className="font-medium">{c.cost}</span></div>)}</div></CardContent>
            </Card>
          </div>

          {result.websiteCode && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Website Preview</CardTitle></CardHeader>
              <CardContent><div className="rounded-lg overflow-hidden border border-white/10 min-h-[200px] flex items-center justify-center bg-black/30" dangerouslySetInnerHTML={{ __html: result.websiteCode }} /></CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
