import { RouteCalculator } from '@/components/calculator/RouteCalculator';
import { HistorySidebar } from '@/components/calculator/HistorySidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Route Calculator | HormuzRoute',
  description: 'AI-powered maritime route optimization for Persian Gulf shipping',
};

export default function AppPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <HistorySidebar />
        <main className="flex-1 px-4 py-8 lg:px-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Route Calculator
              </h1>
              <p className="text-slate-400">
                Compare shipping routes and costs for your cargo through the Persian Gulf
              </p>
            </div>
            <RouteCalculator />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
