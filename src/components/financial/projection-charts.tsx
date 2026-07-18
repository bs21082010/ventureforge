"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { FinancialProjection } from "@/types/financial";
import { formatCurrency } from "@/lib/utils";

interface ProjectionChartsProps {
  projections: FinancialProjection[];
}

const COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#a855f7", "#06b6d4", "#f97316", "#ec4899"];

export function ProjectionCharts({ projections }: ProjectionChartsProps) {
  const [chartType, setChartType] = useState<"revenue" | "comparison" | "pie">("revenue");

  if (projections.length === 0) return null;

  const chartData = projections.map((p) => ({
    period: p.period,
    Revenue: p.revenue,
    Expenses: p.expenses,
    "Net Income": p.netIncome,
    "Cash Flow": p.cashFlow,
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["revenue", "comparison", "pie"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              chartType === t
                ? "bg-blue-600 text-white"
                : "bg-black/30 text-gray-400 border border-white/10 hover:border-blue-500/50"
            }`}
          >
            {t === "revenue" ? "Revenue vs Expenses" : t === "comparison" ? "All Metrics" : "Distribution"}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        {chartType === "revenue" && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="period" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#e5e7eb" }}
                formatter={(value) => [formatCurrency(Number(value)), undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth="2" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === "comparison" && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="period" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#e5e7eb" }}
                formatter={(value) => [formatCurrency(Number(value)), undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "pie" && (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={projections.length > 0 ? [
                  { name: "Total Revenue", value: projections.reduce((s, p) => s + p.revenue, 0) },
                  { name: "Total Expenses", value: projections.reduce((s, p) => s + p.expenses, 0) },
                  { name: "Net Cash Flow", value: Math.abs(projections.reduce((s, p) => s + p.cashFlow, 0)) },
                ] : []}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={130}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#ffffff30" }}
              >
                {COLORS.slice(0, 3).map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                formatter={(value) => [formatCurrency(Number(value)), undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
