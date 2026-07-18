"use client";

import { useEffect, useCallback, useRef } from "react";
import { useFinancialStore } from "@/store/financial-store";
import type { Assumption } from "@/types/plan";

export function useFinancialEngine(assumptions: Assumption[]) {
  const recalculate = useFinancialStore((s) => s.recalculate);
  const result = useFinancialStore((s) => s.result);
  const isCalculating = useFinancialStore((s) => s.isCalculating);
  const prevAssumptionsRef = useRef<string>("");

  useEffect(() => {
    const serialized = JSON.stringify(assumptions);
    if (serialized !== prevAssumptionsRef.current) {
      prevAssumptionsRef.current = serialized;
      recalculate(assumptions);
    }
  }, [assumptions, recalculate]);

  const forceRecalculate = useCallback(() => {
    recalculate(assumptions);
  }, [assumptions, recalculate]);

  return {
    result,
    isCalculating,
    projections: result?.projections || [],
    summary: result?.summary || null,
    scenarios: result?.scenarios || [],
    sensitivity: result?.sensitivityAnalysis || [],
    forceRecalculate,
  };
}
