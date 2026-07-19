"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GamepadIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StudioGuide from "@/components/studio/studio-guide";

const STEPS = [
  { number: 1, title: "Describe your game", description: "Tell the AI the genre, theme, mechanics, and visual style you want." },
  { number: 2, title: "AI builds it instantly", description: "DeepSeek AI generates a complete playable game with HTML5, CSS3, and Canvas." },
  { number: 3, title: "Play & share", description: "Test your game right in the browser. Share the link or embed it anywhere." },
];

const GENRES = ["platformer", "shooter", "racing", "puzzle", "snake", "pong", "flappy", "tetris"];

const EXAMPLES = [
  "A cyberpunk platformer with neon visuals and double-jump mechanics",
  "Space shooter with laser beams and alien waves",
  "Racing game through a neon city at night",
  "Snake game with glowing neon effects and power-ups",
];

export default function GameStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("platformer");
  const [dimension, setDimension] = useState<"2d" | "3d">("2d");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<{ html: string; title: string; description: string; instructions: string; techStack?: string[] } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    setGenerated(false);
    setStatus("Analyzing prompt...");
    try {
      const res = await fetch("/api/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "game", prompt, genre, dimension }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Failed to generate game");
        setTimeout(() => setToast(null), 3000);
        setStatus(null);
        return;
      }
      setResult(data);
      setGenerated(true);
      setStatus(null);
    } catch {
      setToast("Failed to generate game");
      setTimeout(() => setToast(null), 3000);
      setStatus(null);
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
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg text-white">
          <GamepadIcon size={24} />
        </div>
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-[0.2em] font-share-tech-mono">Creation Studio</p>
          <h1 className="text-2xl font-bold text-gray-100">Game Studio</h1>
          <p className="text-sm text-gray-400">
            DeepSeek AI &rarr; Gemini &rarr; Local fallback &mdash; Generates playable games from any description
          </p>
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
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-100">Describe Your Game</h2>
                <Badge variant="info">DeepSeek AI</Badge>
              </div>

              <textarea
                placeholder="e.g., A cyberpunk platformer with neon visuals, double-jump mechanics, and enemy drones..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-400 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />

              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="text-xs text-gray-400 hover:text-blue-400 border border-gray-700 hover:border-blue-500 rounded-full px-3 py-1 transition-colors"
                  >
                    {ex.slice(0, 40)}...
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Dimension</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={dimension === "2d" ? "default" : "outline"} onClick={() => setDimension("2d")}>2D Canvas</Button>
                    <Button size="sm" variant={dimension === "3d" ? "default" : "outline"} onClick={() => setDimension("3d")}>3D WebGL</Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Genre</p>
                  <div className="flex gap-2 flex-wrap">
                    {GENRES.map((g) => (
                      <Button key={g} size="sm" variant={genre === g ? "default" : "outline"} onClick={() => setGenre(g)}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge variant="info">HTML5</Badge>
                <Badge variant="info">CSS3</Badge>
                <Badge variant="info">JavaScript</Badge>
                {dimension === "3d" ? <Badge variant="success">WebGL</Badge> : <Badge variant="success">Canvas 2D</Badge>}
                <Badge variant="warning">DeepSeek AI</Badge>
              </div>

              <Button onClick={generate} disabled={loading || !prompt.trim()} className="w-full">
                {loading ? "Generating..." : "Generate Game"}
              </Button>

              {status && (
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  {status}
                </div>
              )}
            </CardContent>
          </Card>

          {result && generated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{result.title}</CardTitle>
                      <p className="text-sm text-gray-400 mt-1">{result.description}</p>
                      <p className="text-xs text-blue-400 font-medium mt-1">{result.instructions}</p>
                    </div>
                    <Badge variant="success">AI Generated</Badge>
                  </div>
                  {result.techStack && (
                    <div className="flex gap-1 mt-2">
                      {result.techStack.map((t) => <Badge key={t} variant="info">{t}</Badge>)}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
                    <iframe
                      ref={iframeRef}
                      srcDoc={result.html}
                      title={result.title}
                      className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-black"
                      sandbox="allow-scripts"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (iframeRef.current) (iframeRef.current as any).srcdoc = result.html;
                      }}
                    >
                      Restart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setToast("Link copied!");
                        setTimeout(() => setToast(null), 2000);
                      }}
                    >
                      Share
                    </Button>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Providers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-400">
              <p><span className="text-green-400 font-medium">DeepSeek</span> — Primary AI (free, strong reasoning, OpenAI-compatible)</p>
              <p><span className="text-blue-400 font-medium">Gemini</span> — Fallback (free, 1M tokens/day)</p>
              <p><span className="text-yellow-400 font-medium">OpenAI/Ollama</span> — Third fallback</p>
              <p><span className="text-purple-400 font-medium">Local templates</span> — Final fallback (8 genres)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tech Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-400">
              <p><span className="text-blue-400 font-medium">HTML5</span> — Structure, Canvas element, semantic markup</p>
              <p><span className="text-purple-400 font-medium">CSS3</span> — Styling, animations, visual effects</p>
              <p><span className="text-yellow-400 font-medium">JavaScript</span> — Game logic, physics, input handling, asset management</p>
              <p><span className="text-green-400 font-medium">Canvas 2D</span> — 2D rendering, sprites, particles, shadows</p>
              <p><span className="text-cyan-400 font-medium">WebGL</span> — GPU-accelerated 3D graphics, shaders, perspective rendering</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
