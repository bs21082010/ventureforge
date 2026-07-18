"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ComplianceResult, ComplianceCheckItem } from "@/types/compliance";

interface ComplianceCheckerProps {
  jurisdiction: string;
  onCheck: (jurisdiction: string, sections: string[]) => void;
  result: ComplianceResult | null;
  loading: boolean;
}

const SEVERITY_COLORS: Record<string, "success" | "warning" | "danger" | "info" | "purple"> = {
  INFO: "info",
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger",
};

const STATUS_COLORS: Record<string, "success" | "warning" | "danger" | "info"> = {
  PASS: "success",
  WARNING: "warning",
  FAIL: "danger",
  NEEDS_REVIEW: "info",
};

const JURISDICTIONS = ["India", "USA", "UAE", "UK", "Singapore"];

export function ComplianceChecker({ jurisdiction, onCheck, result, loading }: ComplianceCheckerProps) {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(jurisdiction);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "BUSINESS_REGISTRATION",
    "TAX",
    "LABOR",
    "DATA_PRIVACY",
  ]);

  const sections = [
    "BUSINESS_REGISTRATION",
    "TAX",
    "LABOR",
    "ENVIRONMENTAL",
    "DATA_PRIVACY",
    "FINANCIAL",
    "INTELLECTUAL_PROPERTY",
    "EXPORT_IMPORT",
    "HEALTH_SAFETY",
    "ANTI_MONEY_LAUNDERING",
  ];

  return (
    <div className="space-y-6">
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Compliance Check</CardTitle>
          <p className="text-sm text-gray-500">
            Run automated compliance checks against regulations for your jurisdiction.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">Jurisdiction</label>
            <div className="flex flex-wrap gap-2">
              {JURISDICTIONS.map((j) => (
                <Button
                  key={j}
                  variant={selectedJurisdiction === j ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedJurisdiction(j)}
                >
                  {j}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">Regulation Categories</label>
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => {
                const isActive = selectedSections.includes(s);
                return (
                  <Button
                    key={s}
                    variant={isActive ? "primary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedSections((prev) =>
                        isActive ? prev.filter((x) => x !== s) : [...prev, s]
                      );
                    }}
                  >
                    {s.replace(/_/g, " ")}
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => onCheck(selectedJurisdiction, selectedSections)}
            disabled={loading}
          >
            {loading ? "Checking..." : "Run Compliance Check"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Compliance Score</h3>
                <p className="text-sm text-gray-400">{result.summary}</p>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${
                  result.score >= 80 ? "text-green-400" :
                  result.score >= 60 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {result.score}
                </p>
                <Badge variant={STATUS_COLORS[result.overallStatus] || "info"}>
                  {result.overallStatus}
                </Badge>
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={result.score}
                variant={result.score >= 80 ? "success" : result.score >= 60 ? "warning" : "danger"}
                size="lg"
              />
            </div>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.checks.map((check) => (
                  <CheckItem key={check.id} check={check} />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function CheckItem({ check }: { check: ComplianceCheckItem }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="mt-0.5">
        {check.status === "PASS" && (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
        {check.status === "FAIL" && (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {check.status === "WARNING" && (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        )}
        {check.status === "NEEDS_REVIEW" && (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-200">{check.title}</p>
          <Badge variant={SEVERITY_COLORS[check.severity]} size="sm">{check.severity}</Badge>
          <Badge variant={STATUS_COLORS[check.status]} size="sm">{check.status}</Badge>
        </div>
        <p className="text-xs text-gray-400">{check.regulation} - {check.jurisdiction}</p>
        {check.suggestion && (
          <p className="mt-1 text-xs text-blue-400">{check.suggestion}</p>
        )}
      </div>
    </div>
  );
}
