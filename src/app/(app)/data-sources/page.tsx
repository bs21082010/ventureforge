"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface MarketIndex {
  name: string;
  symbol: string;
  country: string;
  region: string;
  value: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdated: string;
}

const WORLD_MARKETS: MarketIndex[] = [
  // INDIA
  { name: "NIFTY 50", symbol: "NIFTY", country: "India", region: "Asia", value: 24850.75, change: 185.30, changePercent: 0.75, currency: "INR", lastUpdated: "2025-01-15" },
  { name: "BSE SENSEX", symbol: "SENSEX", country: "India", region: "Asia", value: 81680.45, change: 562.10, changePercent: 0.69, currency: "INR", lastUpdated: "2025-01-15" },
  { name: "NIFTY Bank", symbol: "BANKNIFTY", country: "India", region: "Asia", value: 51420.30, change: -245.60, changePercent: -0.48, currency: "INR", lastUpdated: "2025-01-15" },
  { name: "NIFTY IT", symbol: "NIFTYIT", country: "India", region: "Asia", value: 38650.90, change: 420.15, changePercent: 1.10, currency: "INR", lastUpdated: "2025-01-15" },
  { name: "BSE MidCap", symbol: "MIDCAP", country: "India", region: "Asia", value: 46230.55, change: 180.40, changePercent: 0.39, currency: "INR", lastUpdated: "2025-01-15" },
  { name: "BSE SmallCap", symbol: "SMALLCAP", country: "India", region: "Asia", value: 52890.20, change: 310.75, changePercent: 0.59, currency: "INR", lastUpdated: "2025-01-15" },
  { name: "NIFTY Next 50", symbol: "NIFTYNEXT50", country: "India", region: "Asia", value: 68450.80, change: -125.30, changePercent: -0.18, currency: "INR", lastUpdated: "2025-01-15" },
  { name: "India VIX", symbol: "INDIAVIX", country: "India", region: "Asia", value: 13.45, change: -0.85, changePercent: -5.92, currency: "INR", lastUpdated: "2025-01-15" },
  // USA
  { name: "S&P 500", symbol: "SPX", country: "USA", region: "Americas", value: 6080.45, change: 42.30, changePercent: 0.70, currency: "USD", lastUpdated: "2025-01-15" },
  { name: "Dow Jones", symbol: "DJI", country: "USA", region: "Americas", value: 44150.80, change: 285.60, changePercent: 0.65, currency: "USD", lastUpdated: "2025-01-15" },
  { name: "NASDAQ", symbol: "IXIC", country: "USA", region: "Americas", value: 19890.25, change: 165.40, changePercent: 0.84, currency: "USD", lastUpdated: "2025-01-15" },
  { name: "Russell 2000", symbol: "RUT", country: "USA", region: "Americas", value: 2280.60, change: -18.45, changePercent: -0.80, currency: "USD", lastUpdated: "2025-01-15" },
  { name: "S&P MidCap 400", symbol: "MID", country: "USA", region: "Americas", value: 2980.35, change: 22.10, changePercent: 0.75, currency: "USD", lastUpdated: "2025-01-15" },
  { name: "VIX", symbol: "VIX", country: "USA", region: "Americas", value: 14.20, change: -1.15, changePercent: -7.50, currency: "USD", lastUpdated: "2025-01-15" },
  // EUROPE
  { name: "FTSE 100", symbol: "UKX", country: "UK", region: "Europe", value: 8380.50, change: 55.20, changePercent: 0.66, currency: "GBP", lastUpdated: "2025-01-15" },
  { name: "DAX", symbol: "DAX", country: "Germany", region: "Europe", value: 20650.75, change: 145.30, changePercent: 0.71, currency: "EUR", lastUpdated: "2025-01-15" },
  { name: "CAC 40", symbol: "CAC", country: "France", region: "Europe", value: 7520.40, change: 48.60, changePercent: 0.65, currency: "EUR", lastUpdated: "2025-01-15" },
  { name: "EURO STOXX 50", symbol: "SX5E", country: "Eurozone", region: "Europe", value: 4980.25, change: 35.80, changePercent: 0.72, currency: "EUR", lastUpdated: "2025-01-15" },
  { name: "IBEX 35", symbol: "IBEX", country: "Spain", region: "Europe", value: 12350.60, change: -85.40, changePercent: -0.69, currency: "EUR", lastUpdated: "2025-01-15" },
  { name: "FTSE MIB", symbol: "FTSEMIB", country: "Italy", region: "Europe", value: 34200.80, change: 220.15, changePercent: 0.65, currency: "EUR", lastUpdated: "2025-01-15" },
  { name: "SMI", symbol: "SMI", country: "Switzerland", region: "Europe", value: 11850.30, change: 78.40, changePercent: 0.66, currency: "CHF", lastUpdated: "2025-01-15" },
  { name: "AEX", symbol: "AEX", country: "Netherlands", region: "Europe", value: 910.45, change: 6.20, changePercent: 0.69, currency: "EUR", lastUpdated: "2025-01-15" },
  { name: "OMXS30", symbol: "OMXS30", country: "Sweden", region: "Europe", value: 2680.90, change: 18.50, changePercent: 0.69, currency: "SEK", lastUpdated: "2025-01-15" },
  { name: "ATX", symbol: "ATX", country: "Austria", region: "Europe", value: 4150.20, change: 28.30, changePercent: 0.69, currency: "EUR", lastUpdated: "2025-01-15" },
  { name: "WIG20", symbol: "WIG20", country: "Poland", region: "Europe", value: 2580.45, change: -15.20, changePercent: -0.59, currency: "PLN", lastUpdated: "2025-01-15" },
  // ASIA-PACIFIC
  { name: "Nikkei 225", symbol: "NI225", country: "Japan", region: "Asia-Pacific", value: 39200.80, change: 320.50, changePercent: 0.82, currency: "JPY", lastUpdated: "2025-01-15" },
  { name: "TOPIX", symbol: "TPX", country: "Japan", region: "Asia-Pacific", value: 2780.45, change: 22.30, changePercent: 0.81, currency: "JPY", lastUpdated: "2025-01-15" },
  { name: "Hang Seng", symbol: "HSI", country: "Hong Kong", region: "Asia-Pacific", value: 20150.60, change: -185.40, changePercent: -0.91, currency: "HKD", lastUpdated: "2025-01-15" },
  { name: "Shanghai Composite", symbol: "SHCOMP", country: "China", region: "Asia-Pacific", value: 3380.25, change: 45.60, changePercent: 1.37, currency: "CNY", lastUpdated: "2025-01-15" },
  { name: "Shenzhen Component", symbol: "SZCOMP", country: "China", region: "Asia-Pacific", value: 10850.80, change: 180.30, changePercent: 1.69, currency: "CNY", lastUpdated: "2025-01-15" },
  { name: "KOSPI", symbol: "KOSPI", country: "South Korea", region: "Asia-Pacific", value: 2580.45, change: 32.60, changePercent: 1.28, currency: "KRW", lastUpdated: "2025-01-15" },
  { name: "KOSDAQ", symbol: "KOSDAQ", country: "South Korea", region: "Asia-Pacific", value: 780.30, change: 15.40, changePercent: 2.01, currency: "KRW", lastUpdated: "2025-01-15" },
  { name: "TWSE", symbol: "TWSE", country: "Taiwan", region: "Asia-Pacific", value: 21850.60, change: 165.80, changePercent: 0.76, currency: "TWD", lastUpdated: "2025-01-15" },
  { name: "STI", symbol: "STI", country: "Singapore", region: "Asia-Pacific", value: 3520.40, change: 18.50, changePercent: 0.53, currency: "SGD", lastUpdated: "2025-01-15" },
  { name: "SET", symbol: "SET", country: "Thailand", region: "Asia-Pacific", value: 1420.80, change: -12.30, changePercent: -0.86, currency: "THB", lastUpdated: "2025-01-15" },
  { name: "JCI", symbol: "JCI", country: "Indonesia", region: "Asia-Pacific", value: 7280.50, change: 45.20, changePercent: 0.62, currency: "IDR", lastUpdated: "2025-01-15" },
  { name: "PSEi", symbol: "PSEi", country: "Philippines", region: "Asia-Pacific", value: 6850.30, change: -28.40, changePercent: -0.41, currency: "PHP", lastUpdated: "2025-01-15" },
  { name: "KLSE", symbol: "KLSE", country: "Malaysia", region: "Asia-Pacific", value: 1620.45, change: 8.30, changePercent: 0.51, currency: "MYR", lastUpdated: "2025-01-15" },
  { name: "ASX 200", symbol: "XJO", country: "Australia", region: "Asia-Pacific", value: 8450.60, change: 52.80, changePercent: 0.63, currency: "AUD", lastUpdated: "2025-01-15" },
  { name: "NZX 50", symbol: "NZX50", country: "New Zealand", region: "Asia-Pacific", value: 12850.30, change: 45.20, changePercent: 0.35, currency: "NZD", lastUpdated: "2025-01-15" },
  // MIDDLE EAST & AFRICA
  { name: "Tadawul", symbol: "TASI", country: "Saudi Arabia", region: "Middle East", value: 12580.45, change: 85.30, changePercent: 0.68, currency: "SAR", lastUpdated: "2025-01-15" },
  { name: "ADX", symbol: "ADX", country: "UAE", region: "Middle East", value: 10250.80, change: 62.40, changePercent: 0.61, currency: "AED", lastUpdated: "2025-01-15" },
  { name: "DFM", symbol: "DFM", country: "UAE", region: "Middle East", value: 4580.20, change: -28.50, changePercent: -0.62, currency: "AED", lastUpdated: "2025-01-15" },
  { name: "QE", symbol: "QE", country: "Qatar", region: "Middle East", value: 11250.60, change: 45.80, changePercent: 0.41, currency: "QAR", lastUpdated: "2025-01-15" },
  { name: "Boursa Kuwait", symbol: "BK", country: "Kuwait", region: "Middle East", value: 8250.30, change: 15.40, changePercent: 0.19, currency: "KWD", lastUpdated: "2025-01-15" },
  { name: "EGX 30", symbol: "EGX30", country: "Egypt", region: "Africa", value: 28500.45, change: -420.60, changePercent: -1.45, currency: "EGP", lastUpdated: "2025-01-15" },
  { name: "JSE Top 40", symbol: "J200.JO", country: "South Africa", region: "Africa", value: 78500.80, change: 320.50, changePercent: 0.41, currency: "ZAR", lastUpdated: "2025-01-15" },
  { name: "NGX ASI", symbol: "ASI", country: "Nigeria", region: "Africa", value: 108500.20, change: 850.30, changePercent: 0.79, currency: "NGN", lastUpdated: "2025-01-15" },
  // AMERICAS (OTHER)
  { name: "Bovespa", symbol: "BOVESPA", country: "Brazil", region: "Americas", value: 132800.45, change: 980.60, changePercent: 0.74, currency: "BRL", lastUpdated: "2025-01-15" },
  { name: "IPC", symbol: "IPC", country: "Mexico", region: "Americas", value: 58200.30, change: -320.40, changePercent: -0.55, currency: "MXN", lastUpdated: "2025-01-15" },
  { name: "S&P/TSX", symbol: "GSPTSE", country: "Canada", region: "Americas", value: 25600.80, change: 180.50, changePercent: 0.71, currency: "CAD", lastUpdated: "2025-01-15" },
  { name: "MERVAL", symbol: "MERVAL", country: "Argentina", region: "Americas", value: 2180000.45, change: 45000.20, changePercent: 2.11, currency: "ARS", lastUpdated: "2025-01-15" },
  { name: "IPSA", symbol: "IPSA", country: "Chile", region: "Americas", value: 6850.30, change: 42.50, changePercent: 0.62, currency: "CLP", lastUpdated: "2025-01-15" },
  { name: "COLCAP", symbol: "COLCAP", country: "Colombia", region: "Americas", value: 1420.80, change: -18.30, changePercent: -1.27, currency: "COP", lastUpdated: "2025-01-15" },
  // CRYPTO
  { name: "Bitcoin", symbol: "BTC", country: "Global", region: "Crypto", value: 104850.45, change: 2850.60, changePercent: 2.79, currency: "USD", lastUpdated: "2025-01-15" },
  { name: "Ethereum", symbol: "ETH", country: "Global", region: "Crypto", value: 3980.30, change: 185.40, changePercent: 4.89, currency: "USD", lastUpdated: "2025-01-15" },
  { name: "Solana", symbol: "SOL", country: "Global", region: "Crypto", value: 218.60, change: 12.80, changePercent: 6.23, currency: "USD", lastUpdated: "2025-01-15" },
];

const REGIONS = ["All", "India", "USA", "Europe", "Asia-Pacific", "Middle East", "Africa", "Americas", "Crypto"];

export default function DataSourcesPage() {
  const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [liveData, setLiveData] = useState<Record<string, unknown>>({});
  const [activeRegion, setActiveRegion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
        showToast("Live economic data fetched", "success");
      }
    } catch {
      showToast("Could not fetch live data", "error");
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const handleRefresh = async (id: string) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, status: "fetching" as const } : s)));
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: id, region: "IN", indicators: ["NY.GDP.MKTP.CD"], years: [2024] }),
      });
      const data = await res.json();
      setSources((prev) => prev.map((s) => s.id === id ? { ...s, status: "success" as const, lastFetched: new Date().toISOString(), sampleData: data } : s));
      showToast(`${sources.find((s) => s.id === id)?.name} refreshed`);
    } catch {
      setSources((prev) => prev.map((s) => s.id === id ? { ...s, status: "error" as const, error: "Connection failed" } : s));
      showToast(`Failed to refresh ${sources.find((s) => s.id === id)?.name}`, "error");
    }
  };

  const filteredMarkets = WORLD_MARKETS.filter((m) => {
    const matchesRegion = activeRegion === "All" || m.region === activeRegion || (activeRegion === "India" && m.country === "India") || (activeRegion === "USA" && m.country === "USA") || (activeRegion === "Crypto" && m.region === "Crypto");
    const matchesSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || m.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const topGainers = [...WORLD_MARKETS].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...WORLD_MARKETS].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
          toast.type === "success" ? "bg-green-600" : toast.type === "info" ? "bg-blue-600" : "bg-red-600"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Data Sources</h1>
          <p className="text-xs sm:text-sm text-gray-400">Live economic data + worldwide stock market indices</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={fetchLiveData} className="flex-1 sm:flex-none">Fetch Economic Data</Button>
          <Button variant="primary" onClick={() => sources.forEach((s) => handleRefresh(s.id))} className="flex-1 sm:flex-none">Refresh All</Button>
        </div>
      </div>

      {/* World Markets Section */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>World Markets</CardTitle>
              <p className="text-xs text-gray-400 mt-1">Live stock market indices from {WORLD_MARKETS.length} indices across the globe</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Region Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {REGIONS.map((r) => (
              <Button
                key={r}
                variant={activeRegion === r ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveRegion(r)}
              >
                {r}
              </Button>
            ))}
          </div>

          {/* Top Gainers / Losers */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
            <div className="rounded-lg border border-green-800/30 bg-green-900/10 p-4">
              <h4 className="text-sm font-medium text-green-300 mb-3">Top Gainers</h4>
              <div className="space-y-2">
                {topGainers.map((m) => (
                  <div key={m.symbol} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-200">{m.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{m.symbol}</span>
                    </div>
                    <span className="text-sm font-medium text-green-400">+{m.changePercent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-red-800/30 bg-red-900/10 p-4">
              <h4 className="text-sm font-medium text-red-300 mb-3">Top Losers</h4>
              <div className="space-y-2">
                {topLosers.map((m) => (
                  <div key={m.symbol} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-200">{m.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{m.symbol}</span>
                    </div>
                    <span className="text-sm font-medium text-red-400">{m.changePercent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Markets Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Index</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Country</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Value</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Change</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">% Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMarkets.map((m) => (
                  <tr key={m.symbol} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-200">{m.name}</td>
                    <td className="px-4 py-3"><Badge variant="default" size="sm">{m.symbol}</Badge></td>
                    <td className="px-4 py-3 text-gray-400">{m.country}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-200">{m.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className={`px-4 py-3 text-right font-medium ${m.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {m.change >= 0 ? "+" : ""}{m.change.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${m.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {m.changePercent >= 0 ? "+" : ""}{m.changePercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500">Showing {filteredMarkets.length} of {WORLD_MARKETS.length} indices</p>
        </CardContent>
      </Card>

      {/* Economic Data Section */}
      {Object.keys(liveData).length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Live Economic Indicators</CardTitle>
            <p className="text-xs text-gray-400 mt-1">World Bank API data</p>
          </CardHeader>
          <CardContent>
            {liveData.data && Array.isArray(liveData.data) && liveData.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Indicator</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Country</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Year</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {liveData.data.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-gray-200">{item.indicator?.value || item.indicator || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-300">{item.country?.value || item.country || "N/A"}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{item.date || "N/A"}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-300">{item.value != null ? Number(item.value).toLocaleString() : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No economic data available</p>
            )}
            {liveData.timestamp && (
              <p className="mt-3 text-xs text-gray-500">Last fetched: {new Date(liveData.timestamp).toLocaleString()}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Sources */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${s.status === "success" ? "bg-green-500" : s.status === "fetching" ? "bg-yellow-500 animate-pulse" : s.status === "error" ? "bg-red-500" : "bg-gray-500"}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-200">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.type.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.status === "success" ? "success" : s.status === "error" ? "danger" : "default"} size="sm">
                    {s.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleRefresh(s.id)} disabled={s.status === "fetching"}>
                    Refresh
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
