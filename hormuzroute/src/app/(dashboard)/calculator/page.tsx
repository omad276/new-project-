import { RouteCalculator } from '@/components/calculator/RouteCalculator';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Route Calculator | HormuzRoute',
  description: 'Calculate optimal maritime shipping routes through the Persian Gulf',
};

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Route Calculator
          </h1>
          <p className="text-slate-400">
            Compare shipping routes and costs for your cargo through the Persian Gulf
          </p>
        </div>
        <RouteCalculator />
      </main>
      <Footer />
    </div>
  );
}
