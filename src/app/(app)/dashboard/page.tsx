"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ParticleField } from "@/components/dashboard/particle-field";

const FALLBACK_STATS = [
  { label: "Active Plans", value: "3", change: "+1 this week" },
  { label: "Revenue Projects", value: "$2.4M", change: "Avg across plans" },
  { label: "Compliance Score", value: "87%", change: "+5% from last check" },
  { label: "AI Suggestions", value: "12", change: "8 accepted" },
];

const FALLBACK_PLANS = [
  { id: "plan_1", title: "TechVenture - AI Analytics", status: "IN_REVIEW", progress: 72 },
  { id: "plan_2", title: "GreenBite - Food Delivery", status: "DRAFT", progress: 35 },
  { id: "plan_3", title: "FinLedger - Banking App", status: "APPROVED", progress: 100 },
];

const ACTIVITY = [
  { time: "2 hours ago", event: "AI generated 3 marketing ideas for TechVenture", type: "ai" },
  { time: "5 hours ago", event: "Compliance check completed for FinLedger (Score: 92)", type: "compliance" },
  { time: "1 day ago", event: "Financial projections updated for GreenBite", type: "financial" },
  { time: "2 days ago", event: "New data source synced: World Bank Economic Data", type: "data" },
  { time: "3 days ago", event: "Plan TechVenture moved to In Review", type: "plan" },
];

const STATUS_COLORS: Record<string, "success" | "warning" | "info" | "danger" | "purple"> = {
  DRAFT: "warning", IN_REVIEW: "info", APPROVED: "success", CERTIFIED: "purple", ARCHIVED: "danger",
};

export default function DashboardPage() {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [recentPlans, setRecentPlans] = useState(FALLBACK_PLANS);
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.plans?.length > 0) {
          const plans = data.plans;
          setRecentPlans(plans.slice(0, 3).map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            progress: p.sections?.filter((s: any) => typeof s.content === "object" && s.content.text).length * 12 || 50,
          })));
          const active = plans.filter((p: any) => p.status !== "ARCHIVED").length;
          setStats([
            { label: "Active Plans", value: String(active), change: `${plans.length} total plans` },
            { label: "Revenue Projects", value: "$2.4M", change: "Avg across plans" },
            { label: "Compliance Score", value: "87%", change: "+5% from last check" },
            { label: "AI Suggestions", value: "12", change: "8 accepted" },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-8">
      <ParticleField
        overlay={
          <div className="text-center px-4">
            <p className="text-xs text-blue-400 uppercase tracking-[0.2em] mb-3 font-share-tech-mono">VentureForge v2.0</p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              Build Your
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"> Empire</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              AI-powered business planning, financial modeling, compliance checks, and market research — all in one command center.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/plans/new">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-5 text-base">Start New Plan</Button>
              </Link>
              <Link href="/studio">
                <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 px-6 py-5 text-base">Open Studio</Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-gray-600 font-share-tech-mono">scroll to explore ▼</p>
          </div>
        }
      />

      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
          toast.type === "success" ? "bg-green-600" : toast.type === "info" ? "bg-blue-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-400">Your business planning command center</p>
        </div>
        <Link href="/plans/new">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">New Business Plan</Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30">
            <CardContent className="p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
            </CardContent>
          </Card>
            </motion.div>
          ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-100">Recent Plans</CardTitle>
                <Link href="/plans" className="text-sm text-blue-400 hover:text-blue-300">View all</Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPlans.map((plan) => (
                  <Link key={plan.id} href={`/plans/${plan.id}`}>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-4 transition-colors hover:border-blue-500/50 hover:bg-blue-900/20 cursor-pointer">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-200">{plan.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant={STATUS_COLORS[plan.status] || "default"} size="sm">{plan.status.replace(/_/g, " ")}</Badge>
                          <span className="text-xs text-gray-500">{plan.progress}% complete</span>
                        </div>
                      </div>
                      <div className="ml-4 w-32">
                        <Progress value={plan.progress} variant={plan.progress === 100 ? "success" : "default"} size="sm" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-gray-100">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Link href="/plans/new">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-center transition-all hover:border-blue-500/50 hover:bg-blue-900/20 cursor-pointer">
                    <svg className="mx-auto mb-2 h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    <p className="text-xs font-medium text-gray-300">New Plan</p>
                  </div>
                </Link>
                <Link href="/financial-engine">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-center transition-all hover:border-green-500/50 hover:bg-green-900/20 cursor-pointer animate-border-glow">
                    <svg className="mx-auto mb-2 h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                    <p className="text-xs font-medium text-gray-300">Financials</p>
                  </div>
                </Link>
                <Link href="/ai-sandbox">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-center transition-all hover:border-purple-500/50 hover:bg-purple-900/20 cursor-pointer">
                    <svg className="mx-auto mb-2 h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                    <p className="text-xs font-medium text-gray-300">AI Sandbox</p>
                  </div>
                </Link>
                <Link href="/compliance">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-center transition-all hover:border-red-500/50 hover:bg-red-900/20 cursor-pointer">
                    <svg className="mx-auto mb-2 h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                    <p className="text-xs font-medium text-gray-300">Compliance</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-gray-100">Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                      item.type === "ai" ? "bg-purple-500" : item.type === "compliance" ? "bg-red-500" :
                      item.type === "financial" ? "bg-green-500" : item.type === "data" ? "bg-blue-500" : "bg-gray-500"
                    }`} />
                    <div>
                      <p className="text-sm text-gray-300">{item.event}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-100">AI Insights</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => showToast("Insights refreshed from latest data", "info")} className="text-gray-400 hover:text-gray-200">Refresh</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-lg bg-blue-900/20 border border-blue-800/30 p-3">
                  <p className="text-xs font-medium text-blue-300">Market Opportunity</p>
                  <p className="mt-1 text-xs text-blue-200/70">Your industry shows 15% growth potential in the target region. Consider expanding the revenue forecast.</p>
                </div>
                <div className="rounded-lg bg-green-900/20 border border-green-800/30 p-3">
                  <p className="text-xs font-medium text-green-300">Cost Optimization</p>
                  <p className="mt-1 text-xs text-green-200/70">Renegotiating vendor contracts could save 8-12% on operating costs based on market benchmarks.</p>
                </div>
                <div className="rounded-lg bg-yellow-900/20 border border-yellow-800/30 p-3">
                  <p className="text-xs font-medium text-yellow-300">Risk Alert</p>
                  <p className="mt-1 text-xs text-yellow-200/70">Inflation in your region is trending upward. Consider adding a 2% buffer to cost projections.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
