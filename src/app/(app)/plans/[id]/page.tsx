"use client";

import { useState, useEffect, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssumptionsPanel } from "@/components/financial/assumptions-panel";
import { ProjectionTable } from "@/components/financial/projection-table";
import { useFinancialStore } from "@/store/financial-store";
import { formatCurrency } from "@/lib/utils";
import { ClipboardIcon, BarChartIcon, LightbulbIcon, MegaphoneIcon, SettingsIcon, DollarSignIcon, AlertTriangleIcon, UsersIcon, FileTextIcon } from "@/components/ui/icons";
import type { Assumption } from "@/types/plan";
import type { ComponentType } from "react";

const MOCK_PLAN_META: Record<string, { title: string; description: string; industry: string; region: string; status: string; version: number }> = {
  plan_1: { title: "TechVenture - AI-Powered Analytics Platform", description: "B2B SaaS platform providing AI-driven business intelligence for mid-market companies.", industry: "Technology", region: "mumbai", status: "IN_REVIEW", version: 2 },
  plan_2: { title: "GreenBite - Organic Food Delivery", description: "Sustainable food delivery service connecting local organic farms with urban consumers.", industry: "Food Service", region: "dubai", status: "DRAFT", version: 1 },
  plan_3: { title: "FinLedger - Digital Banking", description: "Neobank for underserved markets with AI-powered credit scoring.", industry: "Finance", region: "singapore", status: "APPROVED", version: 3 },
};

const FALLBACK_ASSUMPTIONS: Assumption[] = [
  { id: "a1", category: "REVENUE", name: "REVENUE", value: 500000, isDynamic: false },
  { id: "a2", category: "INFLATION", name: "INFLATION", value: 6.5, isDynamic: false },
  { id: "a3", category: "SALARY", name: "SALARY", value: 0.30, isDynamic: false },
  { id: "a4", category: "RENT", name: "RENT", value: 5000, isDynamic: false },
  { id: "a5", category: "MARKETING", name: "MARKETING", value: 0.12, isDynamic: false },
  { id: "a6", category: "TAX", name: "TAX_RATE", value: 25, isDynamic: false },
  { id: "a7", category: "INFLATION", name: "GROWTH_RATE", value: 15, isDynamic: false },
  { id: "a8", category: "INFLATION", name: "GROSS_MARGIN", value: 60, isDynamic: false },
];

const FALLBACK_SECTIONS: { type: string; title: string; icon: ComponentType<{ size?: number }>; defaultContent: string }[] = [
  { type: "EXECUTIVE_SUMMARY", title: "Executive Summary", icon: ClipboardIcon, defaultContent: "This business plan outlines our venture, a technology company positioned for rapid growth in the AI analytics space." },
  { type: "MARKET_ANALYSIS", title: "Market Analysis", icon: BarChartIcon, defaultContent: "The global business intelligence market is projected to reach $54B by 2030, growing at 8.5% CAGR." },
  { type: "PRODUCT_DESCRIPTION", title: "Product Description", icon: LightbulbIcon, defaultContent: "AI-powered analytics platform that transforms raw business data into actionable insights in real-time." },
  { type: "MARKETING_STRATEGY", title: "Marketing Strategy", icon: MegaphoneIcon, defaultContent: "Developer-first go-to-market: content marketing, open-source SDKs, conference sponsorships, and community building." },
  { type: "OPERATIONS_PLAN", title: "Operations Plan", icon: SettingsIcon, defaultContent: "Cloud-native infrastructure on AWS, CI/CD pipelines, 2-week sprint cycles, remote-first team." },
  { type: "FINANCIAL_PLAN", title: "Financial Plan", icon: DollarSignIcon, defaultContent: "Seeking $2M seed round. Break-even in 18 months. Projected $5M ARR by Year 3." },
  { type: "RISK_ASSESSMENT", title: "Risk Assessment", icon: AlertTriangleIcon, defaultContent: "Key risks: market competition, data privacy regulations, talent retention. Mitigations: differentiation, compliance-first design, competitive equity packages." },
  { type: "TEAM_ORGANIZATION", title: "Team & Organization", icon: UsersIcon, defaultContent: "Core team of 8: CEO, CTO, 3 engineers, designer, growth lead, operations manager." },
];

const STATUS_COLORS: Record<string, "success" | "warning" | "info" | "danger" | "purple"> = {
  DRAFT: "warning", IN_REVIEW: "info", APPROVED: "success", CERTIFIED: "purple", ARCHIVED: "danger",
};

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"sections" | "financials" | "ai" | "compliance">("sections");
  const [assumptions, setAssumptions] = useState<Assumption[]>(FALLBACK_ASSUMPTIONS);
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [planMeta, setPlanMeta] = useState(MOCK_PLAN_META[id] || MOCK_PLAN_META.plan_1);
  const [sections, setSections] = useState(FALLBACK_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState([
    { id: "s1", title: "Developer Community Building Strategy", description: "Build an engaged developer community through API documentation, SDKs, hackathons, and developer newsletters.", category: "Marketing", confidence: "High", accepted: null as boolean | null },
    { id: "s2", title: "Cloud-Native Cost Optimization", description: "Switch to reserved instances and spot pricing to reduce cloud infrastructure costs by 30-40%.", category: "Operations", confidence: "Moderate", accepted: null as boolean | null },
    { id: "s3", title: "Strategic Partnership with Data Providers", description: "Partner with 3-5 data providers to offer bundled datasets within the platform, increasing stickiness.", category: "Growth", confidence: "High", accepted: null as boolean | null },
  ]);
  const [complianceResults] = useState([
    { name: "Business Registration", status: "pass", detail: "Companies Act 2013 - Filed" },
    { name: "GST Compliance", status: "pass", detail: "GSTIN active, returns filed" },
    { name: "Data Privacy (DPDP Act)", status: "pass", detail: "Consent mechanisms in place" },
    { name: "Labour Laws", status: "warning", detail: "PF registration pending for 2 new hires" },
    { name: "IP Protection", status: "review", detail: "Trademark application in progress" },
  ]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const result = useFinancialStore((s) => s.result);
  const recalc = useFinancialStore((s) => s.recalculate);

  useEffect(() => {
    fetch(`/api/plans?id=${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.plan) {
          const p = data.plan;
          setPlanMeta(p);
          if (p.assumptions?.length > 0) {
            setAssumptions(p.assumptions);
          }
          if (p.sections?.length > 0) {
            setSections(p.sections.map((s: any) => ({
              type: s.type,
              title: s.title,
              icon: FALLBACK_SECTIONS.find((fs) => fs.type === s.type)?.icon || FileTextIcon,
              defaultContent: typeof s.content === "object" ? (s.content as any).text || s.content as any : s.content,
            })));
            const contentMap: Record<string, string> = {};
            p.sections.forEach((s: any) => {
              const text = typeof s.content === "object" ? (s.content as any).text || "" : s.content;
              contentMap[s.type] = text;
            });
            setSectionContent(contentMap);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRecalc = () => {
    recalc(assumptions);
    showToast("Financial projections recalculated", "success");
  };

  const handleUpdate = (aid: string, value: number) => setAssumptions((prev) => prev.map((a) => (a.id === aid ? { ...a, value } : a)));
  const handleAdd = (a: Assumption) => { setAssumptions((prev) => [...prev, a]); showToast(`Added assumption: ${a.name}`, "success"); };
  const handleRemove = (aid: string) => { setAssumptions((prev) => prev.filter((a) => a.id !== aid)); showToast("Assumption removed", "info"); };

  const startEditSection = (type: string, currentContent: string) => {
    setEditingSection(type);
    setEditText(currentContent);
  };

  const saveSection = (type: string) => {
    setSectionContent((prev) => ({ ...prev, [type]: editText }));
    setEditingSection(null);

    const section = sections.find((s) => s.type === type);
    if (section) {
      fetch("/api/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          sections: sections.map((s) => ({
            type: s.type,
            title: s.title,
            content: { text: s.type === type ? editText : sectionContent[s.type] || "" },
            order: sections.indexOf(s),
          })),
        }),
      }).catch(() => {});
    }
    showToast("Section saved", "success");
  };

  const handleExportPDF = () => showToast("PDF export started - download will begin shortly", "info");
  const handlePublish = () => showToast("Plan submitted for publishing", "success");
  const handleInviteCollab = () => showToast("Invitation link copied to clipboard", "success");

  const acceptSuggestion = (sid: string) => {
    setAiSuggestions((prev) => prev.map((s) => s.id === sid ? { ...s, accepted: true } : s));
    showToast("Suggestion accepted and applied", "success");
  };

  const rejectSuggestion = (sid: string) => {
    setAiSuggestions((prev) => prev.map((s) => s.id === sid ? { ...s, accepted: false } : s));
    showToast("Suggestion rejected", "info");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-100">{planMeta.title}</h1>
            <Badge variant={STATUS_COLORS[planMeta.status]}>{planMeta.status.replace(/_/g, " ")}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-400">{planMeta.description}</p>
          <div className="mt-2 flex gap-2">
            <Badge variant="default">{planMeta.industry}</Badge>
            <Badge variant="default">{planMeta.region}</Badge>
            <Badge variant="default">v{planMeta.version}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>Export PDF</Button>
          <Button variant="primary" size="sm" onClick={handlePublish}>Publish</Button>
          <Button variant="ghost" size="sm" onClick={handleInviteCollab}>Invite</Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(["sections", "financials", "ai", "compliance"] as const).map((tab) => (
          <Button key={tab} variant={activeTab === tab ? "primary" : "ghost"} size="sm" onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === "sections" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const content = sectionContent[section.type] || section.defaultContent;
            const isEditing = editingSection === section.type;
            return (
              <Card key={section.type} variant="bordered" className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400"><section.icon size={20} /></span>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </div>
                    {!isEditing && (
                      <Button variant="ghost" size="sm" onClick={() => startEditSection(section.type, content)}>Edit</Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full rounded-lg border border-gray-300 bg-white text-black p-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={4}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={() => saveSection(section.type)}>Save</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300">{content}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "financials" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Card variant="bordered">
                <AssumptionsPanel assumptions={assumptions} onUpdate={handleUpdate} onAdd={handleAdd} onRemove={handleRemove} />
                <div className="mt-4 px-6 pb-6">
                  <Button variant="primary" className="w-full" onClick={handleRecalc}>Recalculate</Button>
                </div>
              </Card>
            </div>
            <div className="lg:col-span-3">
              {result?.summary && (
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <Card><p className="text-xs text-gray-400">Total Revenue</p><p className="text-lg font-bold text-green-400">{formatCurrency(result.summary.totalRevenue)}</p></Card>
                  <Card><p className="text-xs text-gray-400">Net Profit</p><p className={`text-lg font-bold ${result.summary.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>{formatCurrency(result.summary.netProfit)}</p></Card>
                  <Card><p className="text-xs text-gray-400">Break Even</p><p className="text-lg font-bold text-blue-400">{result.summary.breakEvenPeriod}</p></Card>
                </div>
              )}
              <Card variant="bordered">
                <CardHeader><CardTitle>Projections</CardTitle></CardHeader>
                <CardContent>
                  <ProjectionTable projections={result?.projections.map((p) => ({
                    id: p.period, period: p.period, periodType: "MONTHLY" as const,
                    revenue: p.revenue, expenses: p.cogs + p.operatingExpenses.total,
                    netIncome: p.netIncome, cashFlow: p.cashFlow,
                    assets: p.balanceSheet.totalAssets, liabilities: p.balanceSheet.totalLiabilities,
                    equity: p.balanceSheet.equity, details: {},
                  })) || []} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ai" && (
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Suggestions</CardTitle>
                <p className="text-sm text-gray-500">Explainable AI recommendations with confidence scores</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => {
                setAiSuggestions((prev) => [...prev, {
                  id: `s${Date.now()}`, title: "Competitive Pricing Analysis", description: "Implement dynamic pricing based on competitor monitoring and demand signals.", category: "Strategy", confidence: "High", accepted: null,
                }]);
                showToast("New AI suggestion generated", "success");
              }}>Generate More</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((s) => (
                <div key={s.id} className={`rounded-lg border p-4 transition-colors ${
                  s.accepted === true ? "border-green-800/30 bg-green-900/20" :
                  s.accepted === false ? "border-white/10 bg-black/30 opacity-60" :
                  "border-purple-800/30 bg-purple-900/20"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="purple">{s.category}</Badge>
                    <Badge variant={s.confidence === "High" ? "success" : "warning"}>{s.confidence} Confidence</Badge>
                    {s.accepted === true && <Badge variant="success">Accepted</Badge>}
                    {s.accepted === false && <Badge variant="danger">Rejected</Badge>}
                  </div>
                  <p className="text-sm font-medium text-gray-200">{s.title}</p>
                  <p className="mt-1 text-sm text-gray-400">{s.description}</p>
                  {s.accepted === null && (
                    <div className="mt-3 flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => acceptSuggestion(s.id)}>Accept</Button>
                      <Button variant="ghost" size="sm" onClick={() => rejectSuggestion(s.id)}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "compliance" && (
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Compliance Status</CardTitle>
              <Button variant="primary" size="sm" onClick={() => showToast("Compliance re-check initiated", "info")}>Re-check All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceResults.map((check) => (
                <div key={check.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${check.status === "pass" ? "bg-green-500" : check.status === "warning" ? "bg-yellow-500" : "bg-blue-500"}`} />
                    <div>
                      <span className="text-sm font-medium text-gray-200">{check.name}</span>
                      <p className="text-xs text-gray-400">{check.detail}</p>
                    </div>
                  </div>
                  <Badge variant={check.status === "pass" ? "success" : check.status === "warning" ? "warning" : "info"}>
                    {check.status === "pass" ? "Pass" : check.status === "warning" ? "Warning" : "Review"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
