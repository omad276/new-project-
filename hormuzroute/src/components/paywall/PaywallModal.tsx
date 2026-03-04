'use client';

import { useCalculatorStore, FREE_ANALYSIS_LIMIT } from '@/stores/calculator-store';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Shield, TrendingUp, Zap } from 'lucide-react';

const CONTACT_EMAIL = 'contact@hormuzroute.com';
const MAILTO_LINK = `mailto:${CONTACT_EMAIL}?subject=HormuzRoute%20Subscription%20Request&body=I%20would%20like%20to%20request%20access%20to%20HormuzRoute%20Pro.`;

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

  if (!isPaywallOpen) return null;

  const handleRequestAccess = () => {
    window.location.href = MAILTO_LINK;
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
            Upgrade to continue optimizing your maritime routes.
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
        <Button
          onClick={handleRequestAccess}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold"
        >
          Request Access
        </Button>

        <p className="text-center text-slate-500 text-sm mt-4">
          We&apos;ll reach out within 24 hours to set up your account.
        </p>
      </div>
    </div>
  );
}
