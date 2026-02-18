import { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Home, Percent, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { FinancialCard } from './FinancialCard';
import {
  calculateROI,
  formatCurrency,
  formatPercentage,
} from '@/lib/financial';

interface ROICalculatorProps {
  initialPurchasePrice?: number;
  className?: string;
}

export function ROICalculator({ initialPurchasePrice = 1000000, className = '' }: ROICalculatorProps) {
  const [purchasePrice, setPurchasePrice] = useState(initialPurchasePrice);
  const [currentValue, setCurrentValue] = useState(initialPurchasePrice * 1.2);
  const [annualRentalIncome, setAnnualRentalIncome] = useState(60000);
  const [annualExpenses, setAnnualExpenses] = useState(12000);
  const [yearsHeld, setYearsHeld] = useState(5);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  const downPayment = (purchasePrice * downPaymentPercent) / 100;

  // Calculate ROI
  const roiResult = useMemo(() => {
    return calculateROI({
      purchasePrice,
      currentValue,
      annualRentalIncome,
      annualExpenses,
      yearsHeld,
      downPayment,
    });
  }, [purchasePrice, currentValue, annualRentalIncome, annualExpenses, yearsHeld, downPayment]);

  const getTrendType = (value: number): 'positive' | 'negative' | 'neutral' => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className={`bg-background rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">ROI Calculator</h2>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Purchase Price */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Purchase Price
          </label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
              className="pl-10"
              placeholder="Original purchase price"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">SAR</span>
          </div>
        </div>

        {/* Current Value */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Current / Expected Value
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(Number(e.target.value) || 0)}
              className="pl-10"
              placeholder="Current market value"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">SAR</span>
          </div>
        </div>

        {/* Annual Rental Income */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Annual Rental Income
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="number"
              value={annualRentalIncome}
              onChange={(e) => setAnnualRentalIncome(Number(e.target.value) || 0)}
              className="pl-10"
              placeholder="Yearly rental income"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">SAR</span>
          </div>
        </div>

        {/* Annual Expenses */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Annual Expenses
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="number"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(Number(e.target.value) || 0)}
              className="pl-10"
              placeholder="Maintenance, taxes, insurance"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">SAR</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6 mb-8">
        <Slider
          label="Years Held"
          min={1}
          max={30}
          step={1}
          value={yearsHeld}
          onChange={setYearsHeld}
          formatValue={(v) => `${v} year${v > 1 ? 's' : ''}`}
        />

        <Slider
          label="Down Payment"
          min={0}
          max={100}
          step={5}
          value={downPaymentPercent}
          onChange={setDownPaymentPercent}
          formatValue={(v) => `${v}% (${formatCurrency(downPayment)})`}
        />
      </div>

      {/* Results Section */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Investment Returns</h3>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <FinancialCard
            label="Total ROI"
            value={formatPercentage(roiResult.totalROI)}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={getTrendType(roiResult.totalROI)}
            description={`Over ${yearsHeld} year${yearsHeld > 1 ? 's' : ''}`}
          />
          <FinancialCard
            label="Annualized ROI (CAGR)"
            value={formatPercentage(roiResult.annualizedROI)}
            icon={<Percent className="w-5 h-5" />}
            trend={getTrendType(roiResult.annualizedROI)}
            description="Compound annual growth rate"
          />
          <FinancialCard
            label="Capital Gain"
            value={formatCurrency(roiResult.capitalGain)}
            icon={<DollarSign className="w-5 h-5" />}
            trend={getTrendType(roiResult.capitalGain)}
            description={`${formatPercentage(roiResult.capitalGainPercent)} appreciation`}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {roiResult.netCashFlow !== undefined && (
            <div className="bg-background-secondary rounded-lg p-4 text-center">
              <span className="text-xs text-text-muted block mb-1">Annual Net Cash Flow</span>
              <span className={`font-bold ${roiResult.netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(roiResult.netCashFlow)}
              </span>
            </div>
          )}
          {roiResult.capRate !== undefined && (
            <div className="bg-background-secondary rounded-lg p-4 text-center">
              <span className="text-xs text-text-muted block mb-1">Cap Rate</span>
              <span className="font-bold text-primary">
                {formatPercentage(roiResult.capRate)}
              </span>
            </div>
          )}
          {roiResult.cashOnCashReturn !== undefined && (
            <div className="bg-background-secondary rounded-lg p-4 text-center">
              <span className="text-xs text-text-muted block mb-1">Cash-on-Cash Return</span>
              <span className={`font-bold ${roiResult.cashOnCashReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(roiResult.cashOnCashReturn)}
              </span>
            </div>
          )}
          <div className="bg-background-secondary rounded-lg p-4 text-center">
            <span className="text-xs text-text-muted block mb-1">Total Investment</span>
            <span className="font-bold text-text-primary">
              {formatCurrency(downPayment)}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-background-secondary rounded-lg p-4">
          <h4 className="text-sm font-medium text-text-secondary mb-2">Investment Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Purchase Price:</span>
              <span className="text-text-primary">{formatCurrency(purchasePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Current Value:</span>
              <span className="text-text-primary">{formatCurrency(currentValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Rental Income:</span>
              <span className="text-green-500">{formatCurrency(annualRentalIncome * yearsHeld)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Expenses:</span>
              <span className="text-red-400">{formatCurrency(annualExpenses * yearsHeld)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ROICalculator;
