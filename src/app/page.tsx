"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChartIcon, LinkIcon, MapPinIcon, RobotIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";

const FEATURES = [
  { rank: "01", title: "Financial Engine", desc: "Real-time recalculation of financial projections.", icon: BarChartIcon },
  { rank: "02", title: "Data Backbone", desc: "Government, economic, and industry data with blockchain verification.", icon: LinkIcon },
  { rank: "03", title: "Market Intelligence", desc: "Geospatial data and regional indicators for location-aware plans.", icon: MapPinIcon },
  { rank: "04", title: "Explainable AI", desc: "AI suggestions with citations and confidence scores.", icon: RobotIcon },
  { rank: "05", title: "Compliance Shield", desc: "Cross-jurisdiction checks for legal and financial regulations.", icon: ShieldIcon },
  { rank: "06", title: "Collaboration Hub", desc: "Multi-user editing and blockchain certification.", icon: UsersIcon },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden relative">
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "top",
          animation: "grid-move 20s linear infinite",
        }}
      />

      {/* Glow blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/8 blur-[150px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 border-b border-blue-500/20 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-r from-blue-500 to-purple-500">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <span className="text-lg font-bold font-orbitron tracking-wider bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              VentureForge
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/auth/signin" className="text-sm text-gray-500 hover:text-blue-400 transition-colors font-orbitron tracking-wider">
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="clip-angled bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-bold text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-xs text-blue-400/60 uppercase tracking-[0.3em] mb-8 font-orbitron font-medium">
            AI-Powered Business Platform
          </p>

          <h1
            className="glitch-text font-orbitron text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight inline-block"
            data-text="VENTUREFORGE"
          >
            VENTUREFORGE
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-sm text-gray-500 font-orbitron tracking-wider leading-relaxed">
            AI-POWERED BUSINESS PLANNING — BLENDING CREATIVITY, COMPLIANCE, AND INTEGRATION.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/plans/new"
              className="clip-angled bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-bold text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all font-orbitron tracking-wider"
            >
              Create Plan
            </Link>
            <Link
              href="/dashboard"
              className="clip-angled border border-blue-500/30 bg-white/5 px-8 py-3.5 text-sm font-bold text-blue-400 hover:bg-white/10 hover:border-blue-400/50 transition-all font-orbitron tracking-wider"
            >
              Dashboard
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 inline-grid grid-cols-3 gap-4"
          >
            {[
              { label: "MODULES", value: "10+" },
              { label: "INTEGRATIONS", value: "50+" },
              { label: "USERS", value: "5K+" },
            ].map((s) => (
              <div key={s.label} className="border border-blue-500/10 bg-black/60 p-4 corner-box corner-box-bottom min-w-[130px]">
                <p className="text-xs text-blue-400/60 font-orbitron tracking-wider">{s.label}</p>
                <p className="text-2xl font-black text-white font-orbitron mt-1">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="inline-block font-orbitron text-2xl md:text-3xl font-bold text-white border-l-4 border-r-4 border-blue-500/40 px-8 py-3 bg-black/60">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              CAPABILITIES
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.rank}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative border border-blue-500/10 bg-[#121212] p-6 transition-all duration-300 hover:border-blue-400/40 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] corner-box corner-box-bottom"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-blue-400"><f.icon size={28} /></div>
                <span className="font-orbitron text-xs text-blue-400/40 border border-blue-500/20 px-2 py-1">
                  {f.rank}
                </span>
              </div>
              <h3 className="font-orbitron text-sm font-bold text-white mb-2 tracking-wider group-hover:text-blue-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-orbitron tracking-wide">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-blue-500/20 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-blue-400/60 uppercase tracking-[0.3em] mb-4 font-orbitron font-medium">Get Started</p>
            <h2 className="font-orbitron text-3xl font-black text-white mb-4">READY TO BUILD?</h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto text-sm font-orbitron tracking-wide">
               Join entrepreneurs and institutions using Forge-powered planning.
            </p>
            <Link
              href="/plans/new"
              className="clip-angled bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-4 text-sm font-bold text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all font-orbitron tracking-wider inline-block"
            >
              Create Your First Plan
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-500/10 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 font-orbitron tracking-wider">
            VentureForge © 2024
          </p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-xs text-gray-600 hover:text-blue-400 transition-colors font-orbitron tracking-wider">Pricing</Link>
            <Link href="/studio" className="text-xs text-gray-600 hover:text-blue-400 transition-colors font-orbitron tracking-wider">Studio</Link>
            <Link href="/dashboard" className="text-xs text-gray-600 hover:text-blue-400 transition-colors font-orbitron tracking-wider">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
