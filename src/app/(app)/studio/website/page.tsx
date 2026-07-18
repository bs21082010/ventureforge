"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GlobeIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StudioGuide from "@/components/studio/studio-guide";

const STEPS = [
  { number: 1, title: "Describe your website", description: "Tell the AI the type of site, pages, features, and visual style you need." },
  { number: 2, title: "AI generates the code", description: "A complete website with Next.js + Tailwind CSS is created — responsive and production-ready." },
  { number: 3, title: "Preview & deploy", description: "Preview the site, view the source code, then deploy to Vercel in one click." },
];

export default function WebsiteBuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; preview: string; title: string; techStack: string[]; deploymentSteps: string[] } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "code">("preview");

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "website", prompt, framework: "nextjs" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Failed to generate website");
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setResult(data);
    } catch {
      setToast("Failed to generate website");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      {toast && <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50">{toast}</div>}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg text-white"><GlobeIcon size={24} /></div>
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-[0.2em] font-share-tech-mono">Creation Studio</p>
          <h1 className="text-2xl font-bold text-gray-100">Website Builder</h1>
          <p className="text-sm text-gray-400">Describe a website — AI generates complete code with preview</p>
        </div>
      </motion.div>

      <StudioGuide steps={STEPS} color="#3b82f6" />

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card animated>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-100">Describe Your Website</h2>
            <textarea
              className="w-full min-h-[80px] p-3 rounded-lg border border-gray-300 bg-white text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your website..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={generate} disabled={loading || !prompt.trim()} className="w-full">
              {loading ? "Generating..." : "Generate Website"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{result.title}</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  {result.techStack.map((t) => <Badge key={t} variant="info">{t}</Badge>)}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant={tab === "preview" ? "default" : "outline"} onClick={() => setTab("preview")}>Preview</Button>
                <Button size="sm" variant={tab === "code" ? "default" : "outline"} onClick={() => setTab("code")}>Code</Button>
              </div>
            </CardHeader>
            <CardContent>
              {tab === "preview" ? (
                <div className="rounded-lg overflow-hidden border border-white/10 bg-black/30 min-h-[300px] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: result.preview }} />
              ) : (
                <pre className="bg-black/60 text-green-400 p-4 rounded-lg overflow-x-auto text-xs max-h-[500px] overflow-y-auto"><code>{result.code}</code></pre>
              )}
              {result.deploymentSteps.length > 0 && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                  <p className="text-sm font-medium text-blue-300 mb-1">Deploy to Vercel:</p>
                  {result.deploymentSteps.map((s, i) => <p key={i} className="text-xs text-blue-400 font-mono">$ {s}</p>)}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
