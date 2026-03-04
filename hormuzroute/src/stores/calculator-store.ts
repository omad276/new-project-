import { create } from 'zustand';
import { RouteInput, CalculatedRoute } from '@/types';

const DEFAULT_FORM_DATA: RouteInput = {
  origin: 'ras-tanura',
  destination: 'rotterdam',
  cargoType: 'crude',
  tons: 100000,
  priority: 'cost',
};

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

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Actions
  reset: () => void;
  loadFromHistory: (input: RouteInput, results: CalculatedRoute[]) => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
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
}));
