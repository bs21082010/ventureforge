"use client";

import type { Assumption } from "@/types/plan";
import type { FinancialProjection } from "@/types/financial";
import { formatCurrency } from "@/lib/utils";

interface ExportActionsProps {
  projections: FinancialProjection[];
  assumptions: Assumption[];
}

function generateCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportActions({ projections, assumptions }: ExportActionsProps) {
  const exportProjectionsCSV = () => {
    const headers = ["Period", "Revenue", "Expenses", "Net Income", "Cash Flow"];
    const rows = projections.map((p) => [
      p.period,
      String(p.revenue),
      String(p.expenses),
      String(p.netIncome),
      String(p.cashFlow),
    ]);
    downloadBlob(generateCSV(headers, rows), "projections.csv", "text/csv");
  };

  const exportAssumptionsCSV = () => {
    const headers = ["Name", "Category", "Value"];
    const rows = assumptions.map((a) => [a.name, a.category, String(a.value)]);
    downloadBlob(generateCSV(headers, rows), "assumptions.csv", "text/csv");
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={exportProjectionsCSV}
        disabled={projections.length === 0}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-black/30 text-gray-400 border border-white/10 hover:border-blue-500/50 hover:text-blue-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Projections CSV
        </span>
      </button>
      <button
        onClick={exportAssumptionsCSV}
        disabled={assumptions.length === 0}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-black/30 text-gray-400 border border-white/10 hover:border-blue-500/50 hover:text-blue-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Assumptions CSV
        </span>
      </button>
      <button
        onClick={exportPDF}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-black/30 text-gray-400 border border-white/10 hover:border-blue-500/50 hover:text-blue-400 transition-all"
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Print / PDF
        </span>
      </button>
    </div>
  );
}
