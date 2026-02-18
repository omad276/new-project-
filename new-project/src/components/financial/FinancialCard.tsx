import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinancialCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  description?: string;
  className?: string;
}

export function FinancialCard({
  label,
  value,
  icon,
  trend,
  description,
  className = '',
}: FinancialCardProps) {
  const trendColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-text-muted',
  };

  const TrendIcon = trend === 'positive' ? TrendingUp : trend === 'negative' ? TrendingDown : Minus;

  return (
    <div className={`bg-background-secondary rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-text-secondary">{label}</span>
        {icon && <span className="text-primary">{icon}</span>}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-text-primary">{value}</span>
        {trend && (
          <TrendIcon className={`w-5 h-5 ${trendColors[trend]}`} />
        )}
      </div>

      {description && (
        <p className="text-xs text-text-muted mt-1">{description}</p>
      )}
    </div>
  );
}

export default FinancialCard;
