import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface PropertyTypeChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  className?: string;
}

export function PropertyTypeChart({ data, title, className = '' }: PropertyTypeChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A2E',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number, name: string) => [
                  `${value} (${((value / total) * 100).toFixed(0)}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-text-secondary truncate">{item.name}</span>
              <span className="text-sm font-medium ms-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default PropertyTypeChart;
