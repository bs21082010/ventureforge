import { create } from "zustand";
import type { Plan, PlanSection, Assumption } from "@/types/plan";
import type { FinancialProjection } from "@/types/financial";

interface PlanState {
  plans: Plan[];
  currentPlan: Plan | null;
  isLoading: boolean;
  error: string | null;

  setPlans: (plans: Plan[]) => void;
  setCurrentPlan: (plan: Plan | null) => void;
  addPlan: (plan: Plan) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  removePlan: (id: string) => void;
  updateSection: (planId: string, sectionId: string, content: Record<string, unknown>) => void;
  updateAssumption: (planId: string, assumptionId: string, value: number) => void;
  addAssumption: (planId: string, assumption: Assumption) => void;
  removeAssumption: (planId: string, assumptionId: string) => void;
  setFinancials: (planId: string, projections: FinancialProjection[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  plans: [],
  currentPlan: null,
  isLoading: false,
  error: null,

  setPlans: (plans) => set({ plans }),
  setCurrentPlan: (plan) => set({ currentPlan: plan }),

  addPlan: (plan) =>
    set((state) => ({ plans: [...state.plans, plan] })),

  updatePlan: (id, updates) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentPlan:
        state.currentPlan?.id === id
          ? { ...state.currentPlan, ...updates }
          : state.currentPlan,
    })),

  removePlan: (id) =>
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
      currentPlan:
        state.currentPlan?.id === id ? null : state.currentPlan,
    })),

  updateSection: (planId, sectionId, content) =>
    set((state) => {
      const updatePlanSections = (plan: Plan): Plan =>
        plan.id === planId
          ? {
              ...plan,
              sections: plan.sections.map((s) =>
                s.id === sectionId ? { ...s, content } : s
              ),
            }
          : plan;

      return {
        plans: state.plans.map(updatePlanSections),
        currentPlan: state.currentPlan
          ? updatePlanSections(state.currentPlan)
          : null,
      };
    }),

  updateAssumption: (planId, assumptionId, value) =>
    set((state) => {
      const updatePlanAssumptions = (plan: Plan): Plan =>
        plan.id === planId
          ? {
              ...plan,
              assumptions: plan.assumptions.map((a) =>
                a.id === assumptionId ? { ...a, value } : a
              ),
            }
          : plan;

      return {
        plans: state.plans.map(updatePlanAssumptions),
        currentPlan: state.currentPlan
          ? updatePlanAssumptions(state.currentPlan)
          : null,
      };
    }),

  addAssumption: (planId, assumption) =>
    set((state) => {
      const addPlanAssumption = (plan: Plan): Plan =>
        plan.id === planId
          ? { ...plan, assumptions: [...plan.assumptions, assumption] }
          : plan;

      return {
        plans: state.plans.map(addPlanAssumption),
        currentPlan: state.currentPlan
          ? addPlanAssumption(state.currentPlan)
          : null,
      };
    }),

  removeAssumption: (planId, assumptionId) =>
    set((state) => {
      const removePlanAssumption = (plan: Plan): Plan =>
        plan.id === planId
          ? {
              ...plan,
              assumptions: plan.assumptions.filter(
                (a) => a.id !== assumptionId
              ),
            }
          : plan;

      return {
        plans: state.plans.map(removePlanAssumption),
        currentPlan: state.currentPlan
          ? removePlanAssumption(state.currentPlan)
          : null,
      };
    }),

  setFinancials: (planId, projections) =>
    set((state) => {
      const updatePlanFinancials = (plan: Plan): Plan =>
        plan.id === planId ? { ...plan, financials: projections } : plan;

      return {
        plans: state.plans.map(updatePlanFinancials),
        currentPlan: state.currentPlan
          ? updatePlanFinancials(state.currentPlan)
          : null,
      };
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
