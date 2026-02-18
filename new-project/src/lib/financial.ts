/**
 * Financial calculation utilities for real estate
 */

// Types
export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  loanAmount: number;
  amortizationSchedule: AmortizationRow[];
}

export interface MortgageParams {
  principal: number;
  annualRate: number;
  termYears: number;
}

export interface ROIParams {
  purchasePrice: number;
  currentValue: number;
  annualRentalIncome?: number;
  annualExpenses?: number;
  yearsHeld: number;
  downPayment?: number;
}

export interface ROIResult {
  totalROI: number;
  annualizedROI: number;
  capitalGain: number;
  capitalGainPercent: number;
  netCashFlow?: number;
  capRate?: number;
  cashOnCashReturn?: number;
}

/**
 * Calculate mortgage payment and amortization schedule
 *
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 *   M = Monthly payment
 *   P = Principal (loan amount)
 *   r = Monthly interest rate
 *   n = Total number of payments
 */
export function calculateMortgage(params: MortgageParams): MortgageResult {
  const { principal, annualRate, termYears } = params;

  // Edge case: no loan
  if (principal <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      loanAmount: 0,
      amortizationSchedule: [],
    };
  }

  // Edge case: 0% interest rate
  if (annualRate <= 0) {
    const totalMonths = termYears * 12;
    const monthlyPayment = principal / totalMonths;

    const schedule: AmortizationRow[] = [];
    let balance = principal;

    for (let month = 1; month <= totalMonths; month++) {
      balance -= monthlyPayment;
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: monthlyPayment,
        interest: 0,
        balance: Math.max(0, balance),
      });
    }

    return {
      monthlyPayment,
      totalPayment: principal,
      totalInterest: 0,
      loanAmount: principal,
      amortizationSchedule: schedule,
    };
  }

  const monthlyRate = annualRate / 12;
  const totalMonths = termYears * 12;

  // Calculate monthly payment using amortization formula
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const monthlyPayment = (principal * (monthlyRate * factor)) / (factor - 1);

  // Generate amortization schedule
  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }

  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    loanAmount: principal,
    amortizationSchedule: schedule,
  };
}

/**
 * Calculate ROI (Return on Investment) for a property
 *
 * Total ROI = (Current Value - Purchase Price + Net Income) / Purchase Price * 100
 * Annualized ROI (CAGR) = ((Ending Value / Beginning Value)^(1/years) - 1) * 100
 * Cap Rate = (Net Operating Income / Property Value) * 100
 * Cash-on-Cash = (Annual Pre-Tax Cash Flow / Total Cash Invested) * 100
 */
export function calculateROI(params: ROIParams): ROIResult {
  const {
    purchasePrice,
    currentValue,
    annualRentalIncome = 0,
    annualExpenses = 0,
    yearsHeld,
    downPayment = purchasePrice,
  } = params;

  // Capital gain
  const capitalGain = currentValue - purchasePrice;
  const capitalGainPercent = (capitalGain / purchasePrice) * 100;

  // Net cash flow per year
  const annualNetIncome = annualRentalIncome - annualExpenses;
  const totalNetIncome = annualNetIncome * yearsHeld;

  // Total ROI including rental income
  const totalGain = capitalGain + totalNetIncome;
  const totalROI = (totalGain / purchasePrice) * 100;

  // Annualized ROI (CAGR)
  const endingValue = currentValue + totalNetIncome;
  const years = Math.max(yearsHeld, 1);
  const annualizedROI = (Math.pow(endingValue / purchasePrice, 1 / years) - 1) * 100;

  // Cap Rate (annual NOI / property value)
  const capRate = annualRentalIncome > 0 ? (annualNetIncome / currentValue) * 100 : undefined;

  // Cash-on-Cash Return (annual cash flow / cash invested)
  const cashOnCashReturn =
    annualNetIncome > 0 && downPayment > 0 ? (annualNetIncome / downPayment) * 100 : undefined;

  return {
    totalROI,
    annualizedROI,
    capitalGain,
    capitalGainPercent,
    netCashFlow: annualNetIncome > 0 ? annualNetIncome : undefined,
    capRate,
    cashOnCashReturn,
  };
}

/**
 * Calculate price per square meter
 */
export function calculatePricePerSqm(price: number, area: number): number {
  if (area <= 0) return 0;
  return price / area;
}

/**
 * Calculate rental yield percentage
 */
export function calculateRentalYield(annualRent: number, propertyValue: number): number {
  if (propertyValue <= 0) return 0;
  return (annualRent / propertyValue) * 100;
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number as currency (SAR)
 */
export function formatCurrency(value: number, currency: string = 'SAR'): string {
  const formatted = new Intl.NumberFormat('en-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));

  return `${formatted} ${currency}`;
}

/**
 * Format large numbers with K/M suffix
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
