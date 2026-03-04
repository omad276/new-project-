'use client';

import { useHistoryStore, useCalculatorStore } from '@/stores';
import { HistoryCard } from './HistoryCard';
import { Button } from '@/components/ui/button';
import { History, ChevronLeft, ChevronRight, Trash2, Star } from 'lucide-react';

export function HistorySidebar() {
  const {
    entries,
    favorites,
    sidebarOpen,
    toggleSidebar,
    toggleFavorite,
    isFavorite,
    removeEntry,
    clearHistory,
  } = useHistoryStore();

  const { loadFromHistory } = useCalculatorStore();

  const favoriteEntries = entries.filter((e) => favorites.includes(e.id));
  const recentEntries = entries.filter((e) => !favorites.includes(e.id));

  if (!sidebarOpen) {
    return (
      <div className="hidden lg:flex flex-col items-center py-4 px-2 bg-slate-800/50 border-r border-slate-700">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Open history"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <History className="h-5 w-5 text-slate-500" />
          <span className="text-xs text-slate-500 writing-mode-vertical transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
            History ({entries.length})
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col w-72 bg-slate-800/50 border-r border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-orange-500" />
          <span className="font-medium text-white">History</span>
          <span className="text-xs text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
            {entries.length}
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No calculations yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Your route calculations will appear here
            </p>
          </div>
        ) : (
          <>
            {/* Favorites Section */}
            {favoriteEntries.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
                    Favorites
                  </span>
                </div>
                <div className="space-y-2">
                  {favoriteEntries.map((entry) => (
                    <HistoryCard
                      key={entry.id}
                      entry={entry}
                      isFavorite={true}
                      onLoad={() => loadFromHistory(entry.input, entry.results)}
                      onToggleFavorite={() => toggleFavorite(entry.id)}
                      onDelete={() => removeEntry(entry.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Section */}
            {recentEntries.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
                    Recent
                  </span>
                </div>
                <div className="space-y-2">
                  {recentEntries.map((entry) => (
                    <HistoryCard
                      key={entry.id}
                      entry={entry}
                      isFavorite={isFavorite(entry.id)}
                      onLoad={() => loadFromHistory(entry.input, entry.results)}
                      onToggleFavorite={() => toggleFavorite(entry.id)}
                      onDelete={() => removeEntry(entry.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="p-3 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="w-full text-slate-400 hover:text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
      )}
    </div>
  );
}
