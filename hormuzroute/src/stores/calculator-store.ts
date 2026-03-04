import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RouteInput, CalculatedRoute } from '@/types';

const DEFAULT_FORM_DATA: RouteInput = {
  origin: 'ras-tanura',
  destination: 'rotterdam',
  cargoType: 'crude',
  tons: 100000,
  priority: 'cost',
};

// Free tier limit
export const FREE_ANALYSIS_LIMIT = 3;

interface CalculatorState {
  // Form state
  formData: RouteInput;
  setFormData: (data: Partial<RouteInput>) => void;
  resetFormData: () => void;

  // Results state
  results: CalculatedRoute[] | null;
  setResults: (routes: CalculatedRoute[] | null) => void;

  // Loading states
  isCalculating: boolean;
  setIsCalculating: (loading: boolean) => void;

  // AI state
  aiContent: string;
  setAIContent: (content: string) => void;
  aiLoading: boolean;
  setAILoading: (loading: boolean) => void;
  aiError: string | null;
  setAIError: (error: string | null) => void;
  aiEnabled: boolean;
  setAIEnabled: (enabled: boolean) => void;

  // Usage tracking
  analysisCount: number;
  incrementAnalysisCount: () => void;
  hasReachedLimit: () => boolean;
  getRemainingAnalyses: () => number;

  // Paywall state
  isPaywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Actions
  reset: () => void;
  loadFromHistory: (input: RouteInput, results: CalculatedRoute[]) => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      // Form state
      formData: DEFAULT_FORM_DATA,
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetFormData: () => set({ formData: DEFAULT_FORM_DATA }),

      // Results state
      results: null,
      setResults: (routes) => set({ results: routes }),

      // Loading states
      isCalculating: false,
      setIsCalculating: (loading) => set({ isCalculating: loading }),

      // AI state
      aiContent: '',
      setAIContent: (content) => set({ aiContent: content }),
      aiLoading: false,
      setAILoading: (loading) => set({ aiLoading: loading }),
      aiError: null,
      setAIError: (error) => set({ aiError: error }),
      aiEnabled: true,
      setAIEnabled: (enabled) => set({ aiEnabled: enabled }),

      // Usage tracking
      analysisCount: 0,
      incrementAnalysisCount: () => set((state) => ({ analysisCount: state.analysisCount + 1 })),
      hasReachedLimit: () => get().analysisCount >= FREE_ANALYSIS_LIMIT,
      getRemainingAnalyses: () => Math.max(0, FREE_ANALYSIS_LIMIT - get().analysisCount),

      // Paywall state
      isPaywallOpen: false,
      openPaywall: () => set({ isPaywallOpen: true }),
      closePaywall: () => set({ isPaywallOpen: false }),

      // Error state
      error: null,
      setError: (error) => set({ error }),

      // Actions
      reset: () =>
        set({
          formData: DEFAULT_FORM_DATA,
          results: null,
          isCalculating: false,
          aiContent: '',
          aiLoading: false,
          aiError: null,
          error: null,
        }),

      loadFromHistory: (input, results) =>
        set({
          formData: input,
          results,
          error: null,
          aiContent: '',
          aiError: null,
        }),
    }),
    {
      name: 'hormuzroute-calculator',
      version: 1,
      partialize: (state) => ({
        analysisCount: state.analysisCount,
        aiEnabled: state.aiEnabled,
      }),
    }
  )
);
