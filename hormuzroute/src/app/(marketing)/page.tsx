import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ship, Calculator, Shield, TrendingDown, Clock, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Optimize Your{' '}
              <span className="text-orange-500">Maritime Routes</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Strategic route planning for oil and gas shipping through the
              Persian Gulf. Compare costs, transit times, and risk profiles
              across multiple corridors.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/calculator">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white h-12 px-8 text-lg">
                  Try Calculator
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 h-12 px-8 text-lg"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why HormuzRoute?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <TrendingDown className="h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Cost Optimization
                </h3>
                <p className="text-slate-400">
                  Compare total shipping costs across different routes including
                  vessel charter, insurance, and land transport.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Risk Assessment
                </h3>
                <p className="text-slate-400">
                  Evaluate geopolitical and operational risks for each route
                  corridor to make informed decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <Clock className="h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Transit Time Analysis
                </h3>
                <p className="text-slate-400">
                  Get accurate transit time estimates for planning deliveries
                  and managing supply chain logistics.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Routes Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Supported Route Corridors
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Analyze three major shipping corridors from Persian Gulf ports to
            global destinations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ship className="h-8 w-8 text-red-500" />
                  <h3 className="text-lg font-semibold text-white">
                    Strait of Hormuz
                  </h3>
                </div>
                <p className="text-slate-400 text-sm mb-2">
                  Traditional route via Fujairah. Shortest path but highest
                  geopolitical risk.
                </p>
                <span className="text-xs text-red-500 font-medium">
                  High Risk
                </span>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-8 w-8 text-green-500" />
                  <h3 className="text-lg font-semibold text-white">
                    Petroline Pipeline
                  </h3>
                </div>
                <p className="text-slate-400 text-sm mb-2">
                  East-West pipeline to Red Sea via Yanbu. Bypasses Hormuz
                  entirely.
                </p>
                <span className="text-xs text-green-500 font-medium">
                  Low Risk
                </span>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ship className="h-8 w-8 text-green-500" />
                  <h3 className="text-lg font-semibold text-white">
                    Cape of Good Hope
                  </h3>
                </div>
                <p className="text-slate-400 text-sm mb-2">
                  Long route around Africa. Avoids all chokepoints but adds
                  significant transit time.
                </p>
                <span className="text-xs text-green-500 font-medium">
                  Low Risk
                </span>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-r from-orange-600 to-orange-500 border-0">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Optimize Your Routes?
              </h2>
              <p className="text-orange-100 mb-8 max-w-xl mx-auto">
                Start using our route calculator to compare costs, transit
                times, and risk profiles for your next shipment.
              </p>
              <Link href="/calculator">
                <Button className="bg-white text-orange-600 hover:bg-slate-100 h-12 px-8 text-lg font-semibold">
                  <Calculator className="mr-2 h-5 w-5" />
                  Launch Calculator
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
