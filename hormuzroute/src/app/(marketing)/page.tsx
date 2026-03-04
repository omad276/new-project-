import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  Shield,
  TrendingUp,
  AlertTriangle,
  Fuel,
  FileWarning,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const problems = [
  {
    icon: Fuel,
    title: 'Fuel Volatility',
    description:
      'Unpredictable bunker prices can swing costs by millions on a single voyage.',
  },
  {
    icon: AlertTriangle,
    title: 'Geopolitical Risk',
    description:
      'Strait of Hormuz tensions threaten 20% of global oil transit daily.',
  },
  {
    icon: FileWarning,
    title: 'Insurance Exposure',
    description:
      'War risk premiums can multiply overnight, eroding profit margins.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Input Your Route',
    description:
      'Select origin port, destination, cargo type, and volume in seconds.',
  },
  {
    number: '02',
    title: 'AI Analyzes Options',
    description:
      'Our AI evaluates 3 major corridors for cost, time, and risk tradeoffs.',
  },
  {
    number: '03',
    title: 'Make Smarter Decisions',
    description:
      'Get actionable recommendations with full cost breakdowns and risk insights.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-400">
                AI-Powered Route Intelligence
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered Maritime
              <br />
              <span className="text-orange-500">Route Intelligence</span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Optimize risk, cost, and geopolitical exposure before deployment.
              Make data-driven decisions on Persian Gulf shipping routes in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white h-14 px-10 text-lg font-semibold">
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <p className="text-slate-500 text-sm mt-6">
              3 free AI analyses included. No credit card required.
            </p>
          </div>
        </section>

        {/* Problem Section */}
        <section className="bg-slate-900/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                The Stakes Are Higher Than Ever
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Maritime logistics through the Persian Gulf faces unprecedented
                challenges. One wrong decision can cost millions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {problems.map((problem) => (
                <Card
                  key={problem.title}
                  className="bg-slate-800/50 border-slate-700 text-center"
                >
                  <CardContent className="pt-8 pb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
                      <problem.icon className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {problem.title}
                    </h3>
                    <p className="text-slate-400">{problem.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Get strategic route recommendations in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-orange-500 to-transparent -translate-x-8" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-500/10 border-2 border-orange-500/30 mb-6">
                    <span className="text-3xl font-bold text-orange-500">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-slate-900/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                What You Get
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                'Cost breakdown across 3 major route corridors',
                'AI-powered risk assessment and recommendations',
                'Transit time comparisons with accuracy',
                'Insurance cost estimates by risk level',
                'Geopolitical analysis for each route',
                'Exportable reports for stakeholders',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 py-24">
          <Card className="bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <CardContent className="py-16 text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-8">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Optimize Your Routes?
              </h2>
              <p className="text-orange-100 text-xl mb-10 max-w-2xl mx-auto">
                Join logistics teams using AI to make smarter maritime decisions.
                Start with 3 free analyses today.
              </p>
              <Link href="/app">
                <Button className="bg-white text-orange-600 hover:bg-slate-100 h-14 px-12 text-lg font-semibold shadow-lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Trust Section */}
        <section className="container mx-auto px-4 py-12 text-center">
          <p className="text-slate-500 text-sm">
            Trusted by maritime logistics professionals worldwide
          </p>
          <div className="flex items-center justify-center gap-8 mt-6 opacity-50">
            <Shield className="h-8 w-8 text-slate-600" />
            <span className="text-slate-600 font-semibold">
              Enterprise-Grade Security
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-600 font-semibold">SOC 2 Compliant</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
