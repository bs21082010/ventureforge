"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REGIONS, getUniqueCountries, getStatesForCountry, getCitiesForState } from "@/lib/geospatial/regions";

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
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const countries = useMemo(() => getUniqueCountries(), []);
  const states = useMemo(() => country ? getStatesForCountry(country) : [], [country]);
  const cities = useMemo(() => country && state ? getCitiesForState(country, state) : [], [country, state]);

  const regionId = cities.find(c => c.id === city)?.id || "";

  const handleCreate = async () => {
    if (!title || !industry || !regionId) return;
    setLoading(true);
    showToast("Forge is generating your business plan...", "info");

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, industry, region: regionId }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || "Failed to create plan", "error");
        setLoading(false);
        return;
      }
      if (data.plan) {
        showToast("Business plan created successfully!", "success");
        router.push(`/plans/${data.plan.id}`);
      } else {
        showToast("Failed to create plan. Please try again.", "error");
      }
    } catch (err) {
      console.error("Failed to create plan:", err);
      showToast("Network error. Please check your connection and try again.", "error");
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
        <p className="text-sm text-gray-400">Set up your plan with regional context for Forge-powered insights</p>
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

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">Location</label>
            <p className="text-xs text-gray-500">Plans adapt to local economic conditions, regulations, and market dynamics.</p>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Country</label>
                <select
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setState(""); setCity(""); }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">State</label>
                <select
                  value={state}
                  onChange={(e) => { setState(e.target.value); setCity(""); }}
                  disabled={!country}
                  className="w-full rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!state}
                  className="w-full rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {city && (
              <div className="rounded-lg border border-blue-800/30 bg-blue-900/20 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs">
                  <div><span className="text-gray-400">Currency:</span> <span className="text-gray-200">{REGIONS.find(r => r.id === city)?.currency}</span></div>
                  <div><span className="text-gray-400">Language:</span> <span className="text-gray-200">{REGIONS.find(r => r.id === city)?.language}</span></div>
                  <div><span className="text-gray-400">Market:</span> <span className="text-gray-200">{REGIONS.find(r => r.id === city)?.economicProfile.marketSize}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleCreate} disabled={loading || !title || !industry || !regionId}>
              {loading ? "Creating..." : "Create Business Plan"}
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
