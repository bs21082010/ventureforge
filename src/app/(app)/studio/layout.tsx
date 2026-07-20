"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GamepadIcon, GlobeIcon, SmartphoneIcon, MicroscopeIcon, RocketIcon, SparklesIcon } from "@/components/ui/icons";
import ForgeAIPanel from "@/components/studio/forge-ai-panel";
import type { ComponentType } from "react";

const STUDIO_ITEMS: { id: string; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: "game", label: "Game", icon: GamepadIcon },
  { id: "website", label: "Website", icon: GlobeIcon },
  { id: "app", label: "App", icon: SmartphoneIcon },
  { id: "research", label: "Research", icon: MicroscopeIcon },
  { id: "business", label: "Business", icon: RocketIcon },
];

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [forgeOpen, setForgeOpen] = useState(false);

  const isActive = (id: string) => pathname === `/studio/${id}`;

  return (
    <div className="flex gap-0 min-h-[calc(100vh-5rem)]">
      {/* Studio Sidebar */}
      <aside className="w-16 shrink-0 bg-black/40 border-r border-white/5 flex flex-col items-center py-4 gap-2">
        {/* Forge AI - common across all studios */}
        <button
          onClick={() => setForgeOpen(!forgeOpen)}
          className={cn(
            "flex flex-col items-center gap-0.5 w-12 py-2 rounded-lg transition-colors",
            forgeOpen ? "bg-purple-600/20 text-purple-400" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          )}
          title="Forge AI Assistant"
        >
          <SparklesIcon size={18} />
          <span className="text-[9px] font-medium leading-tight">Forge</span>
        </button>

        <div className="w-8 border-t border-white/10 my-1" />

        {STUDIO_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={`/studio/${item.id}`}
            className={cn(
              "flex flex-col items-center gap-0.5 w-12 py-2 rounded-lg transition-colors",
              isActive(item.id) ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            )}
            title={item.label}
          >
            <item.icon size={18} />
            <span className="text-[9px] font-medium leading-tight">{item.label}</span>
          </Link>
        ))}

        <div className="flex-1" />

        <Link
          href="/studio"
          className={cn(
            "flex flex-col items-center gap-0.5 w-12 py-2 rounded-lg transition-colors text-gray-400 hover:text-gray-200 hover:bg-white/5",
            pathname === "/studio" && "bg-blue-600/20 text-blue-400"
          )}
          title="All Studios"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
          </svg>
          <span className="text-[9px] font-medium leading-tight">All</span>
        </Link>
      </aside>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-hidden"
      >
        {children}
      </motion.div>

      {/* Forge AI Panel */}
      <ForgeAIPanel open={forgeOpen} onClose={() => setForgeOpen(false)} />
    </div>
  );
}
