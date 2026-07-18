import { create } from "zustand";
import type { AISuggestion, CreativityResult, ForesightResult, WorkflowConfig } from "@/types/ai";

interface UIState {
  sidebarOpen: boolean;
  activeTab: string;
  theme: "light" | "dark" | "system";
  notifications: Notification[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  timestamp: number;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeTab: "dashboard",
  theme: "system",
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setTheme: (theme) => set({ theme }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).slice(2),
          timestamp: Date.now(),
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));

interface AIState {
  suggestions: AISuggestion[];
  creativityResults: CreativityResult | null;
  foresight: ForesightResult | null;
  workflow: WorkflowConfig | null;

  setSuggestions: (suggestions: AISuggestion[]) => void;
  addSuggestion: (suggestion: AISuggestion) => void;
  acceptSuggestion: (id: string) => void;
  rejectSuggestion: (id: string, feedback: string) => void;
  setCreativityResults: (results: CreativityResult) => void;
  setForesight: (foresight: ForesightResult) => void;
  setWorkflow: (workflow: WorkflowConfig) => void;
  advanceWorkflow: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  suggestions: [],
  creativityResults: null,
  foresight: null,
  workflow: null,

  setSuggestions: (suggestions) => set({ suggestions }),
  addSuggestion: (suggestion) =>
    set((state) => ({
      suggestions: [...state.suggestions, suggestion],
    })),

  acceptSuggestion: (id) =>
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, isAccepted: true } : s
      ),
    })),

  rejectSuggestion: (id, feedback) =>
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, isAccepted: false, feedback } : s
      ),
    })),

  setCreativityResults: (creativityResults) => set({ creativityResults }),
  setForesight: (foresight) => set({ foresight }),

  setWorkflow: (workflow) => set({ workflow }),
  advanceWorkflow: () =>
    set((state) => {
      if (!state.workflow) return {};
      const steps = [...state.workflow.steps];
      const current = state.workflow.currentStep;
      if (current < steps.length) {
        steps[current] = { ...steps[current], status: "COMPLETED" };
      }
      const next = current + 1;
      if (next < steps.length) {
        steps[next] = { ...steps[next], status: "IN_PROGRESS" };
      }
      return {
        workflow: {
          ...state.workflow,
          steps,
          currentStep: next,
          status: next >= steps.length ? "COMPLETED" : "ACTIVE",
        },
      };
    }),
}));
