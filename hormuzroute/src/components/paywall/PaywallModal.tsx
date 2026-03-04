'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCalculatorStore, FREE_ANALYSIS_LIMIT } from '@/stores/calculator-store';
import { useAuth } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Shield, TrendingUp, Zap, Loader2 } from 'lucide-react';

const valuePoints = [
  {
    icon: Sparkles,
    title: 'Unlimited AI Route Analysis',
    description: 'No limits on AI-powered strategic route recommendations',
  },
  {
    icon: Shield,
    title: 'Advanced Maritime Risk Modeling',
    description: 'Deep geopolitical and operational risk assessments',
  },
  {
    icon: TrendingUp,
    title: 'Strategic Decision Support',
    description: 'Data-driven insights for optimal route selection',
  },
  {
    icon: Zap,
    title: 'Priority Support',
    description: 'Direct access to maritime logistics experts',
  },
];

export function PaywallModal() {
  const { isPaywallOpen, closePaywall, analysisCount } = useCalculatorStore();
  const { user, loading: authLoading } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();

  if (!isPaywallOpen) return null;

  const handleUpgrade = async () => {
    if (!user) {
      // Redirect to signup if not logged in
      closePaywall();
      router.push('/signup?redirect=/app');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: 'pro' }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        console.error('Checkout error:', data.error);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closePaywall}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={closePaywall}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-4">
            <Sparkles className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Unlock Unlimited Strategic Route Intelligence
          </h2>
          <p className="text-slate-400">
            You&apos;ve used {analysisCount} of {FREE_ANALYSIS_LIMIT} free AI analyses.
            {user
              ? ' Upgrade to continue optimizing your maritime routes.'
              : ' Sign up to continue optimizing your maritime routes.'}
          </p>
        </div>

        {/* Value Points */}
        <div className="space-y-4 mb-8">
          {valuePoints.map((point) => (
            <div key={point.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <point.icon className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-medium">{point.title}</h3>
                <p className="text-slate-400 text-sm">{point.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {authLoading ? (
          <div className="flex justify-center py-3">
            <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
          </div>
        ) : user ? (
          <>
            <Button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Upgrade to Pro - $99/month
                </>
              )}
            </Button>
            <p className="text-center text-slate-500 text-sm mt-4">
              Cancel anytime. 7-day money-back guarantee.
            </p>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <Link
                href="/signup?redirect=/app"
                onClick={closePaywall}
                className="block"
              >
                <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Sign Up Free
                </Button>
              </Link>
              <Link
                href="/login?redirect=/app"
                onClick={closePaywall}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full h-12 border-slate-600 text-slate-300 hover:bg-slate-800 text-lg"
                >
                  Already have an account? Sign In
                </Button>
              </Link>
            </div>
            <p className="text-center text-slate-500 text-sm mt-4">
              Free tier includes 10 analyses per month.
              <br />
              Upgrade anytime for unlimited access.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
