'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';
import { UsageStats } from '@/lib/usage';

interface UsageCardProps {
  stats: UsageStats;
}

export function UsageCard({ stats }: UsageCardProps) {
  const isUnlimited = stats.monthlyLimit === -1;
  const usagePercentage = isUnlimited
    ? 0
    : Math.round((stats.monthlyAnalysisCount / stats.monthlyLimit) * 100);
  const remaining = isUnlimited
    ? 'Unlimited'
    : `${stats.monthlyLimit - stats.monthlyAnalysisCount} remaining`;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-orange-500" />
          Usage This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">AI Analyses</span>
              <span className="text-white">
                {stats.monthlyAnalysisCount}
                {!isUnlimited && ` / ${stats.monthlyLimit}`}
              </span>
            </div>

            {!isUnlimited && (
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usagePercentage >= 90
                      ? 'bg-red-500'
                      : usagePercentage >= 70
                      ? 'bg-yellow-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, usagePercentage)}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <span className="text-slate-400 text-sm">{remaining}</span>
            {isUnlimited && (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Pro Access
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-slate-900 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {stats.analysisCount}
              </div>
              <div className="text-xs text-slate-400">Total Analyses</div>
            </div>
            <div className="text-center p-3 bg-slate-900 rounded-lg">
              <div className="text-2xl font-bold text-white capitalize">
                {stats.plan}
              </div>
              <div className="text-xs text-slate-400">Current Plan</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
