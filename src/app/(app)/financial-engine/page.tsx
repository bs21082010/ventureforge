"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssumptionsPanel } from "@/components/financial/assumptions-panel";
import { ProjectionTable } from "@/components/financial/projection-table";
import { ProjectionCharts } from "@/components/financial/projection-charts";
import { ExportActions } from "@/components/financial/export-actions";
import { ScenarioComparison } from "@/components/financial/scenario-comparison";
import { useFinancialStore } from "@/store/financial-store";
import { formatCurrency } from "@/lib/utils";
import type { Assumption } from "@/types/plan";

const DEFAULT_ASSUMPTIONS: Assumption[] = [
  { id: "a1", category: "REVENUE", name: "REVENUE", value: 500000, isDynamic: false },
  { id: "a2", category: "INFLATION", name: "INFLATION", value: 6.5, isDynamic: false },
  { id: "a3", category: "SALARY", name: "SALARY", value: 0.30, isDynamic: false },
  { id: "a4", category: "RENT", name: "RENT", value: 5000, isDynamic: false },
  { id: "a5", category: "MARKETING", name: "MARKETING", value: 0.12, isDynamic: false },
  { id: "a6", category: "TAX", name: "TAX_RATE", value: 25, isDynamic: false },
  { id: "a7", category: "INFLATION", name: "GROWTH_RATE", value: 15, isDynamic: false },
  { id: "a8", category: "INFLATION", name: "GROSS_MARGIN", value: 60, isDynamic: false },
];

export default function FinancialEnginePage() {
  const { data: session } = useSession();
  const [assumptions, setAssumptions] = useState<Assumption[]>(DEFAULT_ASSUMPTIONS);
  const [toast, setToast] = useState<string | null>(null);
  const [modelName, setModelName] = useState("");
  const [savedModels, setSavedModels] = useState<{ id: string; name: string; updatedAt: string }[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [collabInput, setCollabInput] = useState("");

  const result = useFinancialStore((s) => s.result);
  const isCalculating = useFinancialStore((s) => s.isCalculating);
  const recalc = useFinancialStore((s) => s.recalculate);
  const removeScenario = useFinancialStore((s) => s.removeScenario);
  const scenarios = result?.scenarios || [];
  const summary = result?.summary;

  const projections = result?.projections.map((p) => ({
    id: p.period,
    period: p.period,
    periodType: "MONTHLY" as const,
    revenue: p.revenue,
    expenses: p.cogs + p.operatingExpenses.total,
    netIncome: p.netIncome,
    cashFlow: p.cashFlow,
    cumulativeCashFlow: p.cumulativeCashFlow,
    assets: p.balanceSheet.totalAssets,
    liabilities: p.balanceSheet.totalLiabilities,
    equity: p.balanceSheet.equity,
    details: { cogs: p.cogs, grossProfit: p.grossProfit, ebitda: p.ebitda },
  })) || [];

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/financial/models")
        .then((r) => r.json())
        .then((d) => { if (d.models) setSavedModels(d.models); })
        .catch(() => {});
    }
  }, [session]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleRecalculate = () => {
    recalc(assumptions);
    showToast("Financial projections recalculated");
  };

  const handleUpdate = (id: string, value: number) => {
    setAssumptions(assumptions.map((a) => (a.id === id ? { ...a, value } : a)));
  };

  const handleAdd = (a: Assumption) => {
    setAssumptions([...assumptions, a]);
    showToast(`Added: ${a.name}`);
  };

  const handleRemove = (id: string) => {
    setAssumptions(assumptions.filter((a) => a.id !== id));
    showToast("Assumption removed");
  };

  const saveModel = async () => {
    if (!modelName.trim() || !session?.user?.id) return;
    try {
      const res = await fetch("/api/financial/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modelName,
          assumptions,
          scenarios: useFinancialStore.getState().activeScenarios,
          periodRange: useFinancialStore.getState().periodRange,
        }),
      });
      const data = await res.json();
      if (data.model) {
        setSavedModels([data.model, ...savedModels]);
        showToast(`Saved: ${modelName}`);
        setModelName("");
        setShowSaveDialog(false);
      } else {
        showToast(data.error || "Failed to save");
      }
    } catch {
      showToast("Failed to save model");
    }
  };

  const loadModel = async (id: string) => {
    try {
      const res = await fetch(`/api/financial/models`, { method: "GET" });
      const data = await res.json();
      if (!data.models) return;
      const model = data.models.find((m: { id: string }) => m.id === id);
      if (!model) return;
      setAssumptions(JSON.parse(model.assumptions || "[]"));
      if (model.scenarios) {
        const parsed = JSON.parse(model.scenarios);
        if (Array.isArray(parsed)) parsed.forEach((s: any) => useFinancialStore.getState().addScenario(s));
      }
      showToast(`Loaded: ${model.name}`);
    } catch {
      showToast("Failed to load model");
    }
  };

  const deleteModel = async (id: string, name: string) => {
    try {
      await fetch(`/api/financial/models?id=${id}`, { method: "DELETE" });
      setSavedModels(savedModels.filter((m) => m.id !== id));
      showToast(`Deleted: ${name}`);
    } catch {
      showToast("Failed to delete model");
    }
  };

  const addCollaborator = () => {
    if (collabInput.trim() && !collaborators.includes(collabInput.trim())) {
      setCollaborators([...collaborators, collabInput.trim()]);
      setCollabInput("");
      showToast("Collaborator added");
    }
  };

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c !== email));
    showToast("Collaborator removed");
  };

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div variants={variants} initial="hidden" animate="visible" className="space-y-8">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-green-600/90 backdrop-blur-sm px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-[0.2em] mb-1 font-share-tech-mono">Financial Modeling</p>
          <h1 className="text-2xl font-bold text-gray-100">Financial Engine</h1>
          <p className="text-sm text-gray-400">Adjust assumptions to see instant projections</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportActions projections={projections} assumptions={assumptions} />
          <Button variant="primary" onClick={handleRecalculate} disabled={isCalculating}>
            {isCalculating ? "Calculating..." : "Recalculate"}
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Total Revenue", value: formatCurrency(summary.totalRevenue), color: "text-green-400", bg: "from-green-900/30 to-green-950/20" },
            { label: "Total Expenses", value: formatCurrency(summary.totalExpenses), color: "text-red-400", bg: "from-red-900/30 to-red-950/20" },
            { label: "Net Profit", value: formatCurrency(summary.netProfit), color: summary.netProfit >= 0 ? "text-green-400" : "text-red-400", bg: summary.netProfit >= 0 ? "from-green-900/30 to-green-950/20" : "from-red-900/30 to-red-950/20" },
            { label: "Profit Margin", value: `${summary.profitMargin.toFixed(1)}%`, color: "text-blue-400", bg: "from-blue-900/30 to-blue-950/20" },
            { label: "ROI", value: `${summary.roi.toFixed(1)}%`, color: "text-purple-400", bg: "from-purple-900/30 to-purple-950/20" },
            { label: "Break Even", value: summary.breakEvenPeriod, color: "text-yellow-400", bg: "from-yellow-900/30 to-yellow-950/20" },
          ].map((stat) => (
            <Card key={stat.label} className={`bg-gradient-to-br ${stat.bg} border border-white/5`}>
              <CardContent className="p-6 space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Charts */}
      {projections.length > 0 && (
        <motion.div variants={item}>
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectionCharts projections={projections} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Grid: Assumptions + Projections */}
      <motion.div variants={item} className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-6">
          <Card variant="bordered">
            <CardContent className="p-5">
              <AssumptionsPanel
                assumptions={assumptions}
                onUpdate={handleUpdate}
                onAdd={handleAdd}
                onRemove={handleRemove}
              />
            </CardContent>
          </Card>

          {/* Save / Load */}
          {session?.user?.id && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Save / Load</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {!showSaveDialog ? (
                  <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)} className="w-full">
                    Save Current Model
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      label="Model name"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="Q3 2026 Projections"
                    />
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={saveModel} className="flex-1">Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => { setShowSaveDialog(false); setModelName(""); }}>Cancel</Button>
                    </div>
                  </div>
                )}

                {savedModels.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Saved Models</p>
                    {savedModels.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <button onClick={() => loadModel(m.id)} className="text-sm text-gray-300 hover:text-blue-400 transition-colors text-left">
                          {m.name}
                        </button>
                        <button onClick={() => deleteModel(m.id, m.name)} className="text-gray-600 hover:text-red-400 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Collaboration */}
          {session?.user?.id && (
            <Card variant="bordered">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Collaboration</CardTitle>
                  <Badge variant="info" size="sm">beta</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="colleague@example.com"
                    value={collabInput}
                    onChange={(e) => setCollabInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCollaborator()}
                    className="flex-1 rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-400 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <Button variant="primary" size="sm" onClick={addCollaborator}>Add</Button>
                </div>
                {collaborators.length > 0 && (
                  <div className="space-y-1.5">
                    {collaborators.map((email) => (
                      <div key={email} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm text-gray-300">{email}</span>
                        </div>
                        <button onClick={() => removeCollaborator(email)} className="text-gray-600 hover:text-red-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">Share the model ID with collaborators to enable realtime editing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* Projection Table */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectionTable projections={projections} />
            </CardContent>
          </Card>

          {/* Scenario Comparison */}
          {scenarios.length > 0 && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ScenarioComparison
                  baseResult={result ? { summary: result.summary } : null}
                  scenarios={scenarios}
                  activeScenarios={useFinancialStore.getState().activeScenarios}
                  onRemoveScenario={removeScenario}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
