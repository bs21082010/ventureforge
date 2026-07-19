"use client";

import { useState, useEffect, useCallback } from "react";
import { DataDashboard } from "@/components/data/data-dashboard";
import { Button } from "@/components/ui/button";

interface Source {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  lastFetched: string;
  status: "idle" | "fetching" | "success" | "error";
  sampleData?: unknown;
  error?: string;
}

const INITIAL_SOURCES: Source[] = [
  { id: "world_bank", name: "World Bank Open Data", type: "GOVERNMENT_ECONOMIC", isActive: true, lastFetched: "", status: "idle" },
  { id: "imf_data", name: "IMF Economic Data", type: "GOVERNMENT_ECONOMIC", isActive: true, lastFetched: "", status: "idle" },
  { id: "fred", name: "Federal Reserve Economic Data", type: "MARKET_DATA", isActive: true, lastFetched: "", status: "idle" },
  { id: "census_bureau", name: "US Census Bureau", type: "DEMOGRAPHIC", isActive: false, lastFetched: "", status: "idle" },
];

export default function DataSourcesPage() {
  const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [liveData, setLiveData] = useState<Record<string, unknown>>({});

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: "IN",
          indicators: ["NY.GDP.MKTP.CD", "SP.POP.TOTL", "FP.CPI.TOTL.ZG"],
          years: [2022, 2023, 2024],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
        showToast("Live data fetched from World Bank API", "success");
      }
    } catch {
      showToast("Could not fetch live data — using cached", "error");
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const handleRefresh = async (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "fetching" as const } : s))
    );

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: id,
          region: "IN",
          indicators: ["NY.GDP.MKTP.CD"],
          years: [2024],
        }),
      });

      const data = await res.json();

      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "success" as const, lastFetched: new Date().toISOString(), sampleData: data }
            : s
        )
      );
      showToast(`${sources.find((s) => s.id === id)?.name} refreshed successfully`);
    } catch {
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "error" as const, error: "Connection failed" }
            : s
        )
      );
      showToast(`Failed to refresh ${sources.find((s) => s.id === id)?.name}`, "error");
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
          toast.type === "success" ? "bg-green-600" : toast.type === "info" ? "bg-blue-600" : "bg-red-600"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Data Sources</h1>
          <p className="text-sm text-gray-400">Live connections to World Bank, IMF, and FRED economic data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchLiveData}>Fetch Live Data</Button>
          <Button variant="primary" onClick={() => sources.forEach((s) => handleRefresh(s.id))}>
            Refresh All
          </Button>
        </div>
      </div>

      {Object.keys(liveData).length > 0 && (
        <div className="rounded-lg border border-green-800/30 bg-green-900/20 p-4">
          <h3 className="text-sm font-medium text-green-300 mb-3">Live Economic Data (World Bank API)</h3>
          {liveData.data && Array.isArray(liveData.data) && liveData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-800/30">
                    <th className="px-3 py-2 text-left text-xs font-medium text-green-400 uppercase">Indicator</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-green-400 uppercase">Country</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-green-400 uppercase">Year</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-green-400 uppercase">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-800/20">
                  {liveData.data.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-green-900/10">
                      <td className="px-3 py-2 text-gray-200">{item.indicator?.value || item.indicator || "N/A"}</td>
                      <td className="px-3 py-2 text-right text-gray-300">{item.country?.value || item.country || "N/A"}</td>
                      <td className="px-3 py-2 text-right text-gray-300">{item.date || "N/A"}</td>
                      <td className="px-3 py-2 text-right font-medium text-green-300">{item.value != null ? Number(item.value).toLocaleString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-green-400/70">Data fetched successfully — no records available for this query</p>
          )}
          {liveData.timestamp && (
            <p className="mt-2 text-xs text-green-400/50">Last fetched: {new Date(liveData.timestamp).toLocaleString()}</p>
          )}
        </div>
      )}

      <DataDashboard sources={sources} onRefresh={handleRefresh} />
    </div>
  );
}
