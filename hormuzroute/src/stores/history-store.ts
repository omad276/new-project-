import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RouteInput, CalculatedRoute } from '@/types';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  input: RouteInput;
  results: CalculatedRoute[];
  topRouteCost: number;
  topRouteName: string;
}

interface HistoryState {
  // History entries
  entries: HistoryEntry[];
  addEntry: (input: RouteInput, results: CalculatedRoute[]) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      // History entries
      entries: [],

      addEntry: (input, results) => {
        const topRoute = results[0];
        const entry: HistoryEntry = {
          id: generateId(),
          timestamp: Date.now(),
          input,
          results,
          topRouteCost: topRoute?.costBreakdown.total ?? 0,
          topRouteName: topRoute?.route.name ?? 'Unknown',
        };

        set((state) => ({
          entries: [entry, ...state.entries].slice(0, 50), // Keep last 50 entries
        }));
      },

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
          favorites: state.favorites.filter((fid) => fid !== id),
        })),

      clearHistory: () =>
        set({
          entries: [],
          favorites: [],
        }),

      // Favorites
      favorites: [],

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((fid) => fid !== id)
            : [...state.favorites, id],
        })),

      isFavorite: (id) => get().favorites.includes(id),

      // Sidebar state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'hormuzroute-history',
      version: 1,
      partialize: (state) => ({
        entries: state.entries,
        favorites: state.favorites,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
