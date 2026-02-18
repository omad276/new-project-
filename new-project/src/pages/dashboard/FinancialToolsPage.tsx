import { useState } from 'react';
import { Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { MortgageCalculator, ROICalculator } from '@/components/financial';

export function FinancialToolsPage() {
  const [activeTab, setActiveTab] = useState('mortgage');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Financial Tools</h1>
        <p className="text-text-secondary mt-1">
          Calculate mortgage payments, ROI, and analyze investment potential
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('mortgage')}
          className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
            activeTab === 'mortgage'
              ? 'bg-primary text-background'
              : 'bg-background-secondary hover:bg-background-tertiary'
          }`}
        >
          <div className={`p-3 rounded-lg ${activeTab === 'mortgage' ? 'bg-background/20' : 'bg-primary/10'}`}>
            <Calculator className={`w-6 h-6 ${activeTab === 'mortgage' ? 'text-background' : 'text-primary'}`} />
          </div>
          <div className="text-left">
            <span className={`font-semibold block ${activeTab === 'mortgage' ? 'text-background' : 'text-text-primary'}`}>
              Mortgage Calculator
            </span>
            <span className={`text-sm ${activeTab === 'mortgage' ? 'text-background/70' : 'text-text-muted'}`}>
              Payment estimation
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('roi')}
          className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
            activeTab === 'roi'
              ? 'bg-primary text-background'
              : 'bg-background-secondary hover:bg-background-tertiary'
          }`}
        >
          <div className={`p-3 rounded-lg ${activeTab === 'roi' ? 'bg-background/20' : 'bg-primary/10'}`}>
            <TrendingUp className={`w-6 h-6 ${activeTab === 'roi' ? 'text-background' : 'text-primary'}`} />
          </div>
          <div className="text-left">
            <span className={`font-semibold block ${activeTab === 'roi' ? 'text-background' : 'text-text-primary'}`}>
              ROI Calculator
            </span>
            <span className={`text-sm ${activeTab === 'roi' ? 'text-background/70' : 'text-text-muted'}`}>
              Investment returns
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
            activeTab === 'compare'
              ? 'bg-primary text-background'
              : 'bg-background-secondary hover:bg-background-tertiary'
          }`}
        >
          <div className={`p-3 rounded-lg ${activeTab === 'compare' ? 'bg-background/20' : 'bg-primary/10'}`}>
            <BarChart3 className={`w-6 h-6 ${activeTab === 'compare' ? 'text-background' : 'text-primary'}`} />
          </div>
          <div className="text-left">
            <span className={`font-semibold block ${activeTab === 'compare' ? 'text-background' : 'text-text-primary'}`}>
              Compare Properties
            </span>
            <span className={`text-sm ${activeTab === 'compare' ? 'text-background/70' : 'text-text-muted'}`}>
              Side-by-side analysis
            </span>
          </div>
        </button>
      </div>

      {/* Calculator Content */}
      <div className="bg-background-secondary rounded-xl">
        {activeTab === 'mortgage' && <MortgageCalculator />}
        {activeTab === 'roi' && <ROICalculator />}
        {activeTab === 'compare' && (
          <div className="p-8 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Property Comparison
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Select properties from your favorites or saved list to compare their financial metrics side by side.
            </p>
            <button className="mt-4 px-6 py-2 bg-primary text-background rounded-lg font-medium hover:bg-primary-hover transition-colors">
              Select Properties
            </button>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-background-secondary rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Financial Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-green-500 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-text-primary">Down Payment</h4>
              <p className="text-sm text-text-muted">
                A 20% down payment typically offers the best rates and avoids PMI.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-500 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-text-primary">Cap Rate</h4>
              <p className="text-sm text-text-muted">
                A cap rate above 8% is generally considered a good investment return.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-text-primary">Cash-on-Cash</h4>
              <p className="text-sm text-text-muted">
                Target 8-12% cash-on-cash return for rental properties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialToolsPage;
