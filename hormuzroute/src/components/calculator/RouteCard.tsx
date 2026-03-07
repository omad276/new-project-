'use client';

import { CalculatedRoute } from '@/types';
import { formatCurrency } from '@/lib/cost-calculator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CostTable } from './CostTable';
import { Ship, Clock, ShieldAlert, Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface RouteCardProps {
  route: CalculatedRoute;
  rank: number;
}

const riskLabels = {
  1: { label: 'Low Risk', color: 'text-green-500' },
  2: { label: 'Medium Risk', color: 'text-yellow-500' },
  3: { label: 'High Risk', color: 'text-red-500' },
};

export function RouteCard({ route, rank }: RouteCardProps) {
  const riskInfo = riskLabels[route.riskScore as keyof typeof riskLabels];
  const isTopPick = rank === 1;

  return (
    <Card
      className={`bg-slate-800 border-slate-700 ${
        isTopPick ? 'ring-2 ring-orange-500' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              {isTopPick && <Trophy className="h-5 w-5 text-orange-500" />}
              {route.route.name}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              {route.route.description}
            </CardDescription>
          </div>
          {isTopPick && (
            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
              RECOMMENDED
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Ship className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Sea Days</p>
              <p className="text-sm font-medium text-white">
                {route.route.seaDays} days
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Total Transit</p>
              <p className="text-sm font-medium text-white">
                {route.totalDays} days
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Risk Level</p>
              <p className={`text-sm font-medium ${riskInfo.color}`}>
                {riskInfo.label}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <h4 className="text-sm font-medium text-white mb-2">Cost Breakdown</h4>
          <CostTable breakdown={route.costBreakdown} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-slate-400 text-sm">Total Estimated Cost</span>
            <div className="flex items-center gap-2 mt-1">
              {route.pctOverBase > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-400" />
              )}
              <span className={`text-sm font-medium ${route.pctOverBase > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {route.pctOverBase > 0 ? '+' : ''}{route.pctOverBase}% vs Hormuz open
              </span>
            </div>
          </div>
          <span className="text-2xl font-bold text-orange-500">
            {formatCurrency(route.costBreakdown.total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
