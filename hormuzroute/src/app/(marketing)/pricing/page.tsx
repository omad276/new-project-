import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For individual logistics professionals',
    features: [
      '10 route calculations/month',
      'Basic cost breakdown',
      '3 route corridors',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/month',
    description: 'For growing logistics teams',
    features: [
      'Unlimited route calculations',
      'Detailed cost analytics',
      'API access',
      'Priority support',
      'Custom cargo profiles',
      'Historical data export',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large-scale operations',
    features: [
      'Everything in Professional',
      'AI-powered route optimization',
      'Real-time risk monitoring',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export const metadata = {
  title: 'Pricing | HormuzRoute',
  description: 'Choose the right plan for your maritime logistics needs',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your maritime logistics needs. All plans
              include access to our core route calculation features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`bg-slate-800 border-slate-700 relative ${
                  plan.highlighted ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-white text-xl">
                    {plan.name}
                  </CardTitle>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-slate-400">{plan.period}</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-slate-300 text-sm"
                      >
                        <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/app">
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="bg-slate-800 rounded-xl p-8 md:p-12 text-center max-w-3xl mx-auto border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-slate-400 mb-6">
              Contact our sales team to discuss enterprise pricing, custom
              integrations, and volume discounts for your organization.
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Contact Sales
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
