"use client";

import type { ScenarioConfig, ScenarioResult } from "@/types/financial";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ScenarioComparisonProps {
  baseResult: { summary: { totalRevenue: number; totalExpenses: number; netProfit: number; profitMargin: number; roi: number; breakEvenPeriod: string } } | null;
  scenarios: ScenarioResult[];
  activeScenarios: ScenarioConfig[];
  onRemoveScenario: (name: string) => void;
}

export function ScenarioComparison({ baseResult, scenarios, activeScenarios, onRemoveScenario }: ScenarioComparisonProps) {
  if (!baseResult && scenarios.length === 0) return null;

  const metrics = [
    { key: "totalRevenue" as const, label: "Revenue", color: "text-green-400" },
    { key: "totalExpenses" as const, label: "Expenses", color: "text-red-400" },
    { key: "netProfit" as const, label: "Net Profit", color: "text-blue-400" },
    { key: "profitMargin" as const, label: "Margin", color: "text-purple-400", suffix: "%" },
    { key: "roi" as const, label: "ROI", color: "text-yellow-400", suffix: "%" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-100">Scenario Comparison</h3>
        <Badge variant="info">{scenarios.length + 1} scenarios</Badge>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-black/30">
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Metric</th>
              {baseResult && (
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Base Case
                </th>
              )}
              {scenarios.map((s) => (
                <th key={s.name} className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-1.5">
                    {s.name}
                    <button onClick={() => onRemoveScenario(s.name)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {metrics.map((metric) => (
              <tr key={metric.key} className="bg-black/40 backdrop-blur-xl hover:bg-[#1e2a3a] transition-colors">
                <td className="px-5 py-3.5 text-gray-300 font-medium">{metric.label}</td>
                {baseResult && (
                  <td className={`px-5 py-3.5 text-right ${metric.color}`}>
                    {metric.key === "profitMargin" || metric.key === "roi"
                      ? `${baseResult.summary[metric.key].toFixed(1)}${metric.suffix || ""}`
                      : formatCurrency(baseResult.summary[metric.key] as number)}
                  </td>
                )}
                {scenarios.map((s) => {
                  const val = s.summary[metric.key] as number;
                  const base = baseResult ? baseResult.summary[metric.key] as number : 0;
                  const diff = base ? ((val - base) / base) * 100 : 0;
                  return (
                    <td key={s.name} className={`px-5 py-3.5 text-right ${metric.color}`}>
                      <div>
                        {metric.key === "profitMargin" || metric.key === "roi"
                          ? `${val.toFixed(1)}${metric.suffix || ""}`
                          : formatCurrency(val)}
                      </div>
                      {baseResult && diff !== 0 && (
                        <div className={`text-xs ${diff > 0 ? "text-green-500" : "text-red-500"}`}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
