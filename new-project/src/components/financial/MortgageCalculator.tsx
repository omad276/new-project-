import { useState, useMemo } from 'react';
import { Calculator, DollarSign, Percent, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { FinancialCard } from './FinancialCard';
import {
  calculateMortgage,
  formatCurrency,
  formatPercentage,
  type AmortizationRow,
} from '@/lib/financial';

interface MortgageCalculatorProps {
  initialPrice?: number;
  className?: string;
}

const TERM_OPTIONS = [15, 20, 25, 30];

export function MortgageCalculator({ initialPrice = 1000000, className = '' }: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(5);
  const [termYears, setTermYears] = useState(25);
  const [showAmortization, setShowAmortization] = useState(false);

  // Calculate derived values
  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPaymentAmount;

  // Calculate mortgage
  const mortgageResult = useMemo(() => {
    return calculateMortgage({
      principal: loanAmount,
      annualRate: interestRate / 100,
      termYears,
    });
  }, [loanAmount, interestRate, termYears]);

  // Get yearly summary for amortization display
  const yearlySummary = useMemo(() => {
    const yearly: { year: number; principal: number; interest: number; balance: number }[] = [];
    let yearPrincipal = 0;
    let yearInterest = 0;

    mortgageResult.amortizationSchedule.forEach((row, index) => {
      yearPrincipal += row.principal;
      yearInterest += row.interest;

      if ((index + 1) % 12 === 0 || index === mortgageResult.amortizationSchedule.length - 1) {
        yearly.push({
          year: Math.ceil((index + 1) / 12),
          principal: yearPrincipal,
          interest: yearInterest,
          balance: row.balance,
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    });

    return yearly;
  }, [mortgageResult.amortizationSchedule]);

  // Calculate pie chart data
  const principalPercent = (loanAmount / mortgageResult.totalPayment) * 100 || 0;
  const interestPercent = 100 - principalPercent;

  return (
    <div className={`bg-background rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Mortgage Calculator</h2>
      </div>

      {/* Input Section */}
      <div className="space-y-6 mb-8">
        {/* Property Price */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Property Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="number"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value) || 0)}
              className="pl-10"
              placeholder="Enter property price"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">SAR</span>
          </div>
        </div>

        {/* Down Payment Slider */}
        <Slider
          label="Down Payment"
          min={0}
          max={50}
          step={5}
          value={downPaymentPercent}
          onChange={setDownPaymentPercent}
          formatValue={(v) => `${v}% (${formatCurrency(downPaymentAmount)})`}
        />

        {/* Interest Rate Slider */}
        <Slider
          label="Interest Rate"
          min={1}
          max={15}
          step={0.25}
          value={interestRate}
          onChange={setInterestRate}
          formatValue={(v) => formatPercentage(v, 2)}
        />

        {/* Loan Term Selector */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Loan Term (Years)
          </label>
          <div className="flex gap-2">
            {TERM_OPTIONS.map((term) => (
              <button
                key={term}
                onClick={() => setTermYears(term)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  termYears === term
                    ? 'bg-primary text-background'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Payment Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Visual Breakdown */}
          <div className="bg-background-secondary rounded-lg p-4">
            <div className="flex items-center justify-center mb-4">
              {/* Simple Pie Chart using CSS */}
              <div
                className="w-32 h-32 rounded-full relative"
                style={{
                  background: `conic-gradient(
                    #C5A572 0deg ${principalPercent * 3.6}deg,
                    #1A1A2E ${principalPercent * 3.6}deg 360deg
                  )`,
                }}
              >
                <div className="absolute inset-3 bg-background-secondary rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-xs text-text-muted block">Monthly</span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(mortgageResult.monthlyPayment)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-text-secondary">
                  Principal ({formatPercentage(principalPercent, 0)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-background-dark" />
                <span className="text-text-secondary">
                  Interest ({formatPercentage(interestPercent, 0)})
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3">
            <FinancialCard
              label="Monthly Payment"
              value={formatCurrency(mortgageResult.monthlyPayment)}
              icon={<Calendar className="w-5 h-5" />}
            />
            <FinancialCard
              label="Total Payment"
              value={formatCurrency(mortgageResult.totalPayment)}
              icon={<DollarSign className="w-5 h-5" />}
            />
            <FinancialCard
              label="Total Interest"
              value={formatCurrency(mortgageResult.totalInterest)}
              icon={<Percent className="w-5 h-5" />}
              trend="negative"
            />
          </div>
        </div>

        {/* Loan Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
          <div className="bg-background-secondary rounded-lg p-3">
            <span className="text-xs text-text-muted block">Loan Amount</span>
            <span className="font-semibold text-text-primary">{formatCurrency(loanAmount)}</span>
          </div>
          <div className="bg-background-secondary rounded-lg p-3">
            <span className="text-xs text-text-muted block">Down Payment</span>
            <span className="font-semibold text-text-primary">{formatCurrency(downPaymentAmount)}</span>
          </div>
          <div className="bg-background-secondary rounded-lg p-3">
            <span className="text-xs text-text-muted block">Interest Rate</span>
            <span className="font-semibold text-text-primary">{formatPercentage(interestRate)}</span>
          </div>
          <div className="bg-background-secondary rounded-lg p-3">
            <span className="text-xs text-text-muted block">Term</span>
            <span className="font-semibold text-text-primary">{termYears} Years</span>
          </div>
        </div>

        {/* Amortization Schedule Toggle */}
        <button
          onClick={() => setShowAmortization(!showAmortization)}
          className="w-full flex items-center justify-between p-4 bg-background-secondary rounded-lg hover:bg-background-tertiary transition-colors"
        >
          <span className="font-medium text-text-primary">Amortization Schedule</span>
          {showAmortization ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </button>

        {/* Amortization Table */}
        {showAmortization && yearlySummary.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-text-secondary font-medium">Year</th>
                  <th className="text-right py-2 px-3 text-text-secondary font-medium">Principal</th>
                  <th className="text-right py-2 px-3 text-text-secondary font-medium">Interest</th>
                  <th className="text-right py-2 px-3 text-text-secondary font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearlySummary.map((row) => (
                  <tr key={row.year} className="border-b border-border/50">
                    <td className="py-2 px-3 text-text-primary">{row.year}</td>
                    <td className="py-2 px-3 text-right text-green-500">
                      {formatCurrency(row.principal)}
                    </td>
                    <td className="py-2 px-3 text-right text-red-400">
                      {formatCurrency(row.interest)}
                    </td>
                    <td className="py-2 px-3 text-right text-text-primary">
                      {formatCurrency(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MortgageCalculator;
