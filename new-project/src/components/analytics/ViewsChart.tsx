import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ViewsChartProps {
  data: { date: string; views: number; inquiries: number }[];
  title: string;
  className?: string;
}

export function ViewsChart({ data, title, className = '' }: ViewsChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A572" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C5A572" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="inquiriesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
              <XAxis
                dataKey="date"
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
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A2E',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#C5A572' }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#C5A572"
                strokeWidth={2}
                fill="url(#viewsGradient)"
                name="Views"
              />
              <Area
                type="monotone"
                dataKey="inquiries"
                stroke="#22C55E"
                strokeWidth={2}
                fill="url(#inquiriesGradient)"
                name="Inquiries"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-text-secondary">Views</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-text-secondary">Inquiries</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ViewsChart;
