"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REGIONS } from "@/lib/geospatial/regions";

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Manufacturing", "Agriculture", "Real Estate", "Tourism", "Logistics",
  "Energy", "Food Service", "E-Commerce", "Biotech", "Gaming",
];

export default function NewPlanPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleCreate = async () => {
    if (!title || !industry || !region) return;
    setLoading(true);
    showToast("Creating business plan...", "info");

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, industry, region }),
      });
      const data = await response.json();
      if (data.plan) {
        router.push(`/plans/${data.plan.id}`);
      }
    } catch (err) {
      console.error("Failed to create plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
          toast.type === "success" ? "bg-green-600" : toast.type === "info" ? "bg-blue-600" : "bg-red-600"
        }`}>{toast.msg}</div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Create New Business Plan</h1>
        <p className="text-sm text-gray-400">Set up your plan with regional context for AI-powered insights</p>
      </div>

      <Card variant="bordered">
        <CardContent className="space-y-6">
          <Input
            label="Business Plan Title"
            placeholder="e.g., TechVenture - AI Analytics Platform"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white text-black px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Brief description of your business concept..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Industry</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <Button
                  key={ind}
                  variant={industry === ind ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setIndustry(ind)}
                >
                  {ind}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Region / City</label>
            <p className="mb-2 text-xs text-gray-500">Plans adapt to local economic conditions, regulations, and market dynamics.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRegion(r.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    region === r.id
                      ? "border-blue-500 bg-blue-900/20"
                      : "border-white/10 bg-black/40 backdrop-blur-xl hover:border-gray-600"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-200">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.country}</p>
                  <p className="text-xs text-gray-500">{r.economicProfile.marketSize} market</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleCreate} disabled={loading || !title || !industry || !region}>
              {loading ? "Creating..." : "Create Business Plan"}
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
