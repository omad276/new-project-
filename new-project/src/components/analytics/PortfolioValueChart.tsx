import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/financial';

interface PortfolioValueChartProps {
  data: { month: string; value: number }[];
  title: string;
  totalValue: number;
  changePercent: number;
  className?: string;
}

export function PortfolioValueChart({
  data,
  title,
  totalValue,
  changePercent,
  className = '',
}: PortfolioValueChartProps) {
  const isPositive = changePercent >= 0;
  const initialValue = data[0]?.value || 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-3xl font-bold text-primary mt-2">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {isPositive ? '+' : ''}
            {changePercent.toFixed(1)}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A572" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C5A572" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
              <XAxis
                dataKey="month"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A2E',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Value']}
                labelStyle={{ color: '#C5A572' }}
              />
              <ReferenceLine
                y={initialValue}
                stroke="#666"
                strokeDasharray="5 5"
                label={{
                  value: 'Initial',
                  position: 'right',
                  fill: '#666',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#C5A572"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#C5A572', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default PortfolioValueChart;
