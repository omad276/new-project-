'use client';

import { HistoryEntry } from '@/stores/history-store';
import { formatCurrency } from '@/lib/cost-calculator';
import { ORIGIN_PORTS, DESTINATION_PORTS } from '@/lib/routes-data';
import { Star, Trash2, ArrowRight } from 'lucide-react';

interface HistoryCardProps {
  entry: HistoryEntry;
  isFavorite: boolean;
  onLoad: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

export function HistoryCard({
  entry,
  isFavorite,
  onLoad,
  onToggleFavorite,
  onDelete,
}: HistoryCardProps) {
  const originPort = ORIGIN_PORTS.find((p) => p.id === entry.input.origin);
  const destPort = DESTINATION_PORTS.find((p) => p.id === entry.input.destination);

  const date = new Date(entry.timestamp);
  const timeAgo = getTimeAgo(date);

  return (
    <div
      className="group p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-600"
      onClick={onLoad}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-sm text-white truncate">
            <span className="truncate">{originPort?.name || entry.input.origin}</span>
            <ArrowRight className="h-3 w-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{destPort?.name || entry.input.destination}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 capitalize">
              {entry.input.cargoType}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">
              {entry.input.tons.toLocaleString()} tons
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-orange-500">
              {formatCurrency(entry.topRouteCost)}
            </span>
            <span className="text-xs text-slate-500">{timeAgo}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-1 rounded hover:bg-slate-600 transition-colors ${
              isFavorite ? 'text-yellow-500' : 'text-slate-400'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
