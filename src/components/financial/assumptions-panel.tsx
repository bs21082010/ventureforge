"use client";

import { useState } from "react";
import type { Assumption } from "@/types/plan";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AssumptionsPanelProps {
  assumptions: Assumption[];
  onUpdate: (id: string, value: number) => void;
  onAdd: (assumption: Assumption) => void;
  onRemove: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  REVENUE: "Revenue",
  COST: "Cost",
  INFLATION: "Inflation",
  RENT: "Rent",
  SALARY: "Salary",
  SUPPLY_CHAIN: "Supply Chain",
  MARKETING: "Marketing",
  TAX: "Tax",
  INTEREST_RATE: "Interest Rate",
  EXCHANGE_RATE: "Exchange Rate",
  CUSTOMER_ACQUISITION: "Customer Acquisition",
  CHURN_RATE: "Churn Rate",
};

export function AssumptionsPanel({ assumptions, onUpdate, onAdd, onRemove }: AssumptionsPanelProps) {
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] = useState<string>("REVENUE");

  const handleAdd = () => {
    if (!newName || !newValue) return;
    onAdd({
      id: Math.random().toString(36).slice(2),
      category: newCategory as Assumption["category"],
      name: newName,
      value: parseFloat(newValue),
      isDynamic: false,
    });
    setNewName("");
    setNewValue("");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-100">Assumptions</h3>
        <Badge variant="info">{assumptions.length} active</Badge>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-black/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {assumptions.map((a) => (
              <tr key={a.id} className="bg-black/40 backdrop-blur-xl hover:bg-[#1e2a3a] transition-colors">
                <td className="px-4 py-3.5 text-gray-200 font-medium">{a.name}</td>
                <td className="px-4 py-3.5">
                  <Badge variant="purple" size="sm">{CATEGORY_LABELS[a.category] || a.category}</Badge>
                </td>
                <td className="px-4 py-3.5">
                  <input
                    type="number"
                    value={a.value}
                    onChange={(e) => onUpdate(a.id, parseFloat(e.target.value) || 0)}
                    className="w-full max-w-[130px] rounded-lg border border-gray-300 bg-white text-black px-3 py-1.5 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ml-auto block"
                    step="0.01"
                  />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => onRemove(a.id)} className="h-8 w-8 p-0">
                    <svg className="h-4 w-4 text-gray-400 hover:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-dashed border-white/10 bg-black/30 p-5 space-y-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Add New Assumption</p>
        <div className="space-y-3">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Assumption name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-400 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-400 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            step="0.01"
          />
          <Button variant="primary" size="sm" onClick={handleAdd} className="w-full">
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
