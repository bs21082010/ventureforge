import type {
  RecalculationInput,
  RecalculationResult,
} from "@/types/financial";
import type { Assumption } from "@/types/plan";
import { recalculate } from "./engine";

type Listener = (result: RecalculationResult) => void;

class RecalculationEngine {
  private listeners: Map<string, Listener[]> = new Map();
  private debouncedTimers: Map<string, NodeJS.Timeout> = new Map();
  private latestResults: Map<string, RecalculationResult> = new Map();
  private pendingUpdates: Map<string, RecalculationInput> = new Map();

  subscribe(planId: string, listener: Listener): () => void {
    const existing = this.listeners.get(planId) || [];
    existing.push(listener);
    this.listeners.set(planId, existing);

    const cached = this.latestResults.get(planId);
    if (cached) {
      listener(cached);
    }

    return () => {
      const current = this.listeners.get(planId) || [];
      this.listeners.set(
        planId,
        current.filter((l) => l !== listener)
      );
    };
  }

  triggerRecalculation(
    input: RecalculationInput,
    debounceMs = 150
  ): void {
    const { planId } = input;
    this.pendingUpdates.set(planId, input);

    const existingTimer = this.debouncedTimers.get(planId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      const pending = this.pendingUpdates.get(planId);
      if (pending) {
        const result = recalculate(pending);
        this.latestResults.set(planId, result);
        this.notifyListeners(planId, result);
        this.pendingUpdates.delete(planId);
      }
      this.debouncedTimers.delete(planId);
    }, debounceMs);

    this.debouncedTimers.set(planId, timer);
  }

  recalculateImmediate(input: RecalculationInput): RecalculationResult {
    const result = recalculate(input);
    this.latestResults.set(input.planId, result);
    this.notifyListeners(input.planId, result);
    return result;
  }

  updateAssumption(
    planId: string,
    assumptions: Assumption[],
    periodRange: RecalculationInput["periodRange"],
    scenarios?: RecalculationInput["scenarios"]
  ): void {
    this.triggerRecalculation({
      planId,
      assumptions,
      periodRange,
      scenarios,
    });
  }

  getLatestResult(planId: string): RecalculationResult | undefined {
    return this.latestResults.get(planId);
  }

  private notifyListeners(planId: string, result: RecalculationResult): void {
    const listeners = this.listeners.get(planId) || [];
    listeners.forEach((listener) => {
      try {
        listener(result);
      } catch (e) {
        console.error(`Listener error for plan ${planId}:`, e);
      }
    });
  }

  cleanup(planId: string): void {
    this.listeners.delete(planId);
    this.latestResults.delete(planId);
    this.pendingUpdates.delete(planId);
    const timer = this.debouncedTimers.get(planId);
    if (timer) clearTimeout(timer);
    this.debouncedTimers.delete(planId);
  }

  cleanupAll(): void {
    this.listeners.clear();
    this.latestResults.clear();
    this.pendingUpdates.clear();
    this.debouncedTimers.forEach((timer) => clearTimeout(timer));
    this.debouncedTimers.clear();
  }
}

export const financialEngine = new RecalculationEngine();
