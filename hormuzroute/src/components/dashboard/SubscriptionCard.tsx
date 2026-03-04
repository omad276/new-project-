'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { UsageStats } from '@/lib/usage';
import { PLANS, PlanType } from '@/lib/stripe';

interface SubscriptionCardProps {
  stats: UsageStats;
}

export function SubscriptionCard({ stats }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);
  const plan = PLANS[stats.plan];
  const isPaid = stats.plan !== 'free';

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (stats.subscriptionStatus) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-green-400 text-sm">
            <CheckCircle className="h-4 w-4" />
            Active
          </span>
        );
      case 'past_due':
        return (
          <span className="flex items-center gap-1 text-yellow-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            Past Due
          </span>
        );
      case 'canceled':
        return (
          <span className="flex items-center gap-1 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            Canceled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            Subscription
          </CardTitle>
          {isPaid && getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-slate-400 text-sm">
                {stats.plan === 'free'
                  ? 'Free tier'
                  : `$${plan.price}/month`}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                stats.plan === 'enterprise'
                  ? 'bg-purple-500/20 text-purple-400'
                  : stats.plan === 'pro'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {stats.plan.toUpperCase()}
            </div>
          </div>

          {stats.currentPeriodEnd && (
            <p className="text-slate-400 text-sm">
              {stats.subscriptionStatus === 'canceled'
                ? 'Access until: '
                : 'Next billing date: '}
              {new Date(stats.currentPeriodEnd).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          <div className="pt-2 border-t border-slate-700">
            <h4 className="text-sm font-medium text-white mb-2">Plan Features:</h4>
            <ul className="space-y-1">
              {plan.features.slice(0, 4).map((feature) => (
                <li
                  key={feature}
                  className="text-slate-400 text-sm flex items-center gap-2"
                >
                  <CheckCircle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {isPaid && (
            <Button
              onClick={handleManageSubscription}
              disabled={loading}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
