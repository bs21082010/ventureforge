"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StudioGuide from "@/components/studio/studio-guide";

const STEPS = [
  { number: 1, title: "Describe your game", description: "Tell the AI the genre, theme, mechanics, and visual style you want." },
  { number: 2, title: "AI builds it instantly", description: "A complete playable HTML5 game is generated with JavaScript game logic and CSS." },
  { number: 3, title: "Play & share", description: "Test your game right in the browser. Share the link or embed it anywhere." },
];

export default function GameStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ html: string; title: string; description: string; instructions: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "game", prompt, genre: "platform" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Failed to generate game");
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setResult(data);
    } catch {
      setToast("Failed to generate game");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {toast && <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50">{toast}</div>}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-lg">🎮</div>
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-[0.2em] font-share-tech-mono">Creation Studio</p>
          <h1 className="text-2xl font-bold text-gray-100">Game Studio</h1>
          <p className="text-sm text-gray-400">Describe a game — AI builds it as a playable HTML5 game</p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2 space-y-6"
        >
          <Card animated>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-100">Describe Your Game</h2>
              <textarea
                placeholder="e.g., A cyberpunk platformer with neon visuals, double-jump mechanics, and enemy drones..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-400 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <Button onClick={generate} disabled={loading || !prompt.trim()} className="w-full">
                {loading ? "Generating..." : "Generate Game"}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{result.title}</CardTitle>
                  <p className="text-sm text-gray-400">{result.description}</p>
                  <p className="text-xs text-blue-400 font-medium">{result.instructions}</p>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    <iframe
                      srcDoc={result.html}
                      title={result.title}
                      className="w-full h-[500px] bg-black"
                      sandbox="allow-scripts"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <StudioGuide steps={STEPS} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
