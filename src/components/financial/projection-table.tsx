"use client";

import type { FinancialProjection } from "@/types/financial";
import { formatCurrency } from "@/lib/utils";

interface ProjectionTableProps {
  projections: FinancialProjection[];
}

export function ProjectionTable({ projections }: ProjectionTableProps) {
  if (projections.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl p-10 text-center">
        <p className="text-sm text-gray-400">No projections yet. Add assumptions to see financial projections.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-white/10 bg-black/30">
            <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Period</th>
            <th className="px-4 py-3.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
            <th className="px-4 py-3.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Expenses</th>
            <th className="px-4 py-3.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Net Income</th>
            <th className="px-4 py-3.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Cash Flow</th>
            <th className="px-4 py-3.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Assets</th>
            <th className="px-4 py-3.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Liabilities</th>
            <th className="px-4 py-3.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Equity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {projections.map((p, i) => (
            <tr key={p.id || i} className="bg-black/40 backdrop-blur-xl hover:bg-[#1e2a3a] transition-colors">
              <td className="px-4 py-3.5 font-medium text-gray-200">{p.period}</td>
              <td className="px-4 py-3.5 text-right text-green-400">{formatCurrency(p.revenue)}</td>
              <td className="px-4 py-3.5 text-right text-red-400">{formatCurrency(p.expenses)}</td>
              <td className={`px-4 py-3.5 text-right font-medium ${p.netIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(p.netIncome)}
              </td>
              <td className={`px-4 py-3.5 text-right ${p.cashFlow >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(p.cashFlow)}
              </td>
              <td className="px-4 py-3.5 text-right text-blue-400">{formatCurrency(p.assets)}</td>
              <td className="px-4 py-3.5 text-right text-orange-400">{formatCurrency(p.liabilities)}</td>
              <td className={`px-4 py-3.5 text-right ${p.equity >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(p.equity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
