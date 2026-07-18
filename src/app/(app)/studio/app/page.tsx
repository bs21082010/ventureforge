"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StudioGuide from "@/components/studio/studio-guide";

const STEPS = [
  { number: 1, title: "Describe your app", description: "Tell the AI what your app does — features, screens, target audience." },
  { number: 2, title: "AI generates the code", description: "A complete Expo/React Native app with navigation and components." },
  { number: 3, title: "Build & ship", description: "Follow the EAS build steps to generate APK/IPA and publish to stores." },
];

export default function AppBuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; screens: string[]; title: string; techStack: string[]; buildSteps: string[] } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "app", prompt, platform: "expo" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Failed to generate app");
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setResult(data);
    } catch {
      setToast("Failed to generate app");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      {toast && <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50">{toast}</div>}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-2xl shadow-lg">📱</div>
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-[0.2em] font-share-tech-mono">Creation Studio</p>
          <h1 className="text-2xl font-bold text-gray-100">App Builder</h1>
          <p className="text-sm text-gray-400">Describe a mobile app — AI generates Expo/React Native code</p>
        </div>
      </motion.div>

      <StudioGuide steps={STEPS} color="#22c55e" />

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card animated>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-100">Describe Your App</h2>
            <textarea
              className="w-full min-h-[80px] p-3 rounded-lg border border-gray-300 bg-white text-black text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your app..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={generate} disabled={loading || !prompt.trim()} className="w-full">
              {loading ? "Generating..." : "Generate App Code"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{result.title}</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  {result.techStack.map((t) => <Badge key={t} variant="info">{t}</Badge>)}
                </div>
              </div>
              <div className="flex gap-2 mt-1 flex-wrap">
                {result.screens.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">App.tsx</CardTitle></CardHeader>
            <CardContent>
              <pre className="bg-black/60 text-green-400 p-4 rounded-lg overflow-x-auto text-xs max-h-[500px] overflow-y-auto"><code>{result.code}</code></pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Build Steps</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.buildSteps.map((s, i) => (
                  <div key={i} className="p-2 bg-black/30 border border-white/10 rounded text-sm font-mono text-gray-300">{s}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
