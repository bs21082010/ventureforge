"use client";

import { useState } from "react";
import { ComplianceChecker } from "@/components/compliance/compliance-checker";
import type { ComplianceResult } from "@/types/compliance";

export default function CompliancePage() {
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCheck = async (jurisdiction: string, sections: string[]) => {
    setLoading(true);
    showToast("Running compliance checks...");
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jurisdiction,
          industry: "Technology",
          sections,
        }),
      });
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      console.error("Compliance check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Compliance Automation</h1>
        <p className="text-sm text-gray-400">Automated checks for legal, financial, and regulatory compliance</p>
      </div>
      <ComplianceChecker
        jurisdiction="India"
        onCheck={handleCheck}
        result={result}
        loading={loading}
      />
    </div>
  );
}
