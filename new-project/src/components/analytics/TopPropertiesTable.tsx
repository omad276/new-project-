import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Eye, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/financial';

interface TopProperty {
  id: string;
  title: string;
  image: string;
  price: number;
  views: number;
  favorites: number;
  inquiries: number;
  trend: 'up' | 'down' | 'stable';
}

interface TopPropertiesTableProps {
  properties: TopProperty[];
  title: string;
  className?: string;
}

export function TopPropertiesTable({ properties, title, className = '' }: TopPropertiesTableProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-text-muted',
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-start p-4 text-sm font-medium text-text-secondary">
                  Property
                </th>
                <th className="text-center p-4 text-sm font-medium text-text-secondary">
                  <Eye className="w-4 h-4 mx-auto" />
                </th>
                <th className="text-center p-4 text-sm font-medium text-text-secondary">
                  <Heart className="w-4 h-4 mx-auto" />
                </th>
                <th className="text-center p-4 text-sm font-medium text-text-secondary">
                  <MessageSquare className="w-4 h-4 mx-auto" />
                </th>
                <th className="text-end p-4 text-sm font-medium text-text-secondary">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property, index) => (
                <tr
                  key={property.id}
                  className="border-b border-border/50 hover:bg-background-secondary/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-text-muted w-6">{index + 1}</span>
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px]">
                          {property.title}
                        </p>
                        <p className="text-xs text-primary">{formatCurrency(property.price)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-medium">{property.views.toLocaleString()}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-medium">{property.favorites}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-medium">{property.inquiries}</span>
                  </td>
                  <td className="p-4 text-end">
                    <div className={`flex items-center justify-end gap-1 ${trendColors[property.trend]}`}>
                      <TrendingUp
                        className={`w-4 h-4 ${property.trend === 'down' ? 'rotate-180' : ''} ${
                          property.trend === 'stable' ? 'opacity-50' : ''
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {property.trend === 'up' ? 'Rising' : property.trend === 'down' ? 'Falling' : 'Stable'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default TopPropertiesTable;
