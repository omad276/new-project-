import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus, Eye, Heart, MessageSquare, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string | number;
  change: number;
  icon: typeof Eye;
  description?: string;
}

interface PerformanceMetricsProps {
  metrics: Metric[];
  title: string;
  className?: string;
}

export function PerformanceMetrics({ metrics, title, className = '' }: PerformanceMetricsProps) {
  const getTrendIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-text-muted';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const TrendIcon = getTrendIcon(metric.change);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-background-secondary"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <metric.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">{metric.label}</p>
                    <p className="text-xl font-bold">{metric.value}</p>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1', getTrendColor(metric.change))}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {metric.change > 0 ? '+' : ''}
                    {metric.change}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default PerformanceMetrics;
