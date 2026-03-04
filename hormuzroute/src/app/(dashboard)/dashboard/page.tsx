import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUsageStats } from '@/lib/usage';
import { Header } from '@/components/layout/Header';
import { UsageCard, SubscriptionCard, UpgradeButton } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, History, Settings, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Dashboard | HormuzRoute',
  description: 'Manage your HormuzRoute account and view usage statistics',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirect=/dashboard');
  }

  const stats = await getUsageStats(supabase, user.id);

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-400">
            Error loading dashboard. Please try again.
          </div>
        </main>
      </div>
    );
  }

  const isFree = stats.plan === 'free';

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Welcome back! Manage your account and view your usage.
          </p>
        </div>

        {isFree && (
          <Card className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/50 mb-8">
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  Unlock Unlimited AI Analyses
                </h3>
                <p className="text-slate-300 text-sm">
                  Upgrade to Professional for unlimited route analyses and premium features.
                </p>
              </div>
              <UpgradeButton plan="pro" />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <UsageCard stats={stats} />
          <SubscriptionCard stats={stats} />
        </div>

        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/app">
            <Card className="bg-slate-800 border-slate-700 hover:border-orange-500/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-orange-500" />
                  Route Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">
                  Calculate optimal routes and get AI-powered recommendations.
                </p>
                <span className="text-orange-500 text-sm flex items-center gap-1">
                  Calculate Route <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/app?tab=history">
            <Card className="bg-slate-800 border-slate-700 hover:border-orange-500/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <History className="h-5 w-5 text-orange-500" />
                  Analysis History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">
                  View your past route calculations and saved favorites.
                </p>
                <span className="text-orange-500 text-sm flex items-center gap-1">
                  View History <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-slate-800 border-slate-700 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-500" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Update your profile and notification preferences.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-400"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-slate-900 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-sm">
            <strong className="text-white">Account:</strong>{' '}
            {user.email}
          </p>
        </div>
      </main>
    </div>
  );
}
