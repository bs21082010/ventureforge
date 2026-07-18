"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Plan {
  id: string;
  title: string;
  description: string;
  industry: string;
  region: string;
  status: string;
  version: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, "success" | "warning" | "info" | "danger" | "purple"> = {
  DRAFT: "warning",
  IN_REVIEW: "info",
  APPROVED: "success",
  CERTIFIED: "purple",
  ARCHIVED: "danger",
};

const FALLBACK_PLANS: Plan[] = [
  { id: "plan_1", title: "TechVenture - AI Analytics Platform", description: "B2B SaaS for mid-market BI", industry: "Technology", region: "Mumbai", status: "IN_REVIEW", version: 2, createdAt: "2025-01-15" },
  { id: "plan_2", title: "GreenBite - Organic Food Delivery", description: "Farm-to-table delivery service", industry: "Food Service", region: "Dubai", status: "DRAFT", version: 1, createdAt: "2025-02-20" },
  { id: "plan_3", title: "FinLedger - Digital Banking", description: "Neobank for underserved markets", industry: "Finance", region: "Singapore", status: "APPROVED", version: 3, createdAt: "2024-11-10" },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.plans?.length > 0) setPlans(data.plans);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.industry.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Business Plans</h1>
          <p className="text-sm text-gray-400">Manage all your business plans in one place</p>
        </div>
        <Link href="/plans/new">
          <Button variant="primary">Create New Plan</Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search plans by title or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "DRAFT", "IN_REVIEW", "APPROVED", "CERTIFIED"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s === "ALL" ? "All" : s.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plan) => (
            <Link key={plan.id} href={`/plans/${plan.id}`}>
              <Card variant="bordered" className="h-full cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{plan.title}</CardTitle>
                    <Badge variant={STATUS_COLORS[plan.status] || "default"}>
                      {plan.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex gap-2">
                    <Badge variant="default">{plan.industry}</Badge>
                    <Badge variant="default">{plan.region}</Badge>
                    <Badge variant="default">v{plan.version}</Badge>
                  </div>
                  <p className="text-xs text-gray-400">Created {new Date(plan.createdAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-black/40 backdrop-blur-xl p-12 text-center">
          <p className="text-gray-400">No plans found. Create your first business plan!</p>
        </div>
      )}
    </div>
  );
}
