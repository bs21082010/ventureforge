"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudioHubPage() {
  const studios = [
    { id: "game", title: "Game Studio", desc: "Create playable HTML5 games from any idea", emoji: "🎮", color: "from-purple-600 to-pink-500" },
    { id: "website", title: "Website Builder", desc: "Generate full websites with Next.js & Tailwind", emoji: "🌐", color: "from-blue-600 to-cyan-500" },
    { id: "app", title: "App Builder", desc: "Build React Native / Expo mobile apps", emoji: "📱", color: "from-green-600 to-emerald-500" },
    { id: "research", title: "Research Hub", desc: "Deep-dive into any market or industry", emoji: "🔬", color: "from-yellow-500 to-orange-500" },
    { id: "business", title: "Business Builder", desc: "Business plans + websites + apps — all in one", emoji: "🚀", color: "from-red-600 to-rose-500" },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-10">
      <motion.div variants={item} className="text-center space-y-3">
        <p className="text-xs text-blue-400 uppercase tracking-[0.2em] font-share-tech-mono">VentureForge Studio</p>
        <h1 className="text-4xl font-bold">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Creation Studio
          </span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">Pick a studio. Describe what you want. AI builds it.</p>
      </motion.div>

      <motion.div variants={item} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {studios.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <a href={`/studio/${s.id}`}>
              <Card animated className="group cursor-pointer hover:-translate-y-1 transition-all duration-200 h-full">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`text-4xl w-16 h-16 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-3xl">{s.emoji}</span>
                  </div>
                  <CardTitle className="text-lg text-gray-100">{s.title}</CardTitle>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                  <Button variant="outline" size="sm" className="mt-auto">
                    Open Studio
                  </Button>
                </CardContent>
              </Card>
            </a>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
