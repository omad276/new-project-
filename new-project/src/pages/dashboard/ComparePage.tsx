import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitCompare,
  Plus,
  X,
  Check,
  Minus,
  MapPin,
  Calculator,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Slider } from '@/components/ui/Slider';
import { cn, formatPrice, formatArea } from '@/lib/utils';
import {
  calculateMortgage,
  calculatePricePerSqm,
  calculateRentalYield,
  formatCurrency,
  formatPercentage,
} from '@/lib/financial';
import type { Property, PropertyStatus } from '@/types';
import type { BadgeProps } from '@/components/ui/Badge';

// Mock data for comparison
const mockCompareProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa in Riyadh',
    titleAr: 'فيلا فاخرة في الرياض',
    description: 'Beautiful villa',
    descriptionAr: 'فيلا جميلة',
    type: 'villa',
    status: 'for_sale',
    price: 2500000,
    currency: 'SAR',
    area: 450,
    bedrooms: 5,
    bathrooms: 4,
    location: {
      address: 'Al Olaya',
      addressAr: 'العليا',
      city: 'Riyadh',
      cityAr: 'الرياض',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
    },
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    features: ['Pool', 'Garden', 'Garage', 'Smart Home', 'Security'],
    ownerId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Modern Villa in Jeddah',
    titleAr: 'فيلا حديثة في جدة',
    description: 'Modern villa',
    descriptionAr: 'فيلا حديثة',
    type: 'villa',
    status: 'for_sale',
    price: 2800000,
    currency: 'SAR',
    area: 520,
    bedrooms: 6,
    bathrooms: 5,
    location: {
      address: 'Al Shati',
      addressAr: 'الشاطئ',
      city: 'Jeddah',
      cityAr: 'جدة',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
    },
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    features: ['Pool', 'Garden', 'Garage', 'Sea View', 'Gym'],
    ownerId: '2',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

// Available properties to add
const mockAvailableProperties: Property[] = [
  ...mockCompareProperties,
  {
    id: '3',
    title: 'Penthouse in Riyadh',
    titleAr: 'بنتهاوس في الرياض',
    description: 'Luxury penthouse',
    descriptionAr: 'بنتهاوس فاخر',
    type: 'apartment',
    status: 'for_sale',
    price: 4500000,
    currency: 'SAR',
    area: 350,
    bedrooms: 4,
    bathrooms: 3,
    location: {
      address: 'Al Nakheel',
      addressAr: 'النخيل',
      city: 'Riyadh',
      cityAr: 'الرياض',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
    },
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    features: ['Terrace', 'Smart Home', 'Concierge', 'Gym', 'Parking'],
    ownerId: '3',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    title: 'Family Villa',
    titleAr: 'فيلا عائلية',
    description: 'Spacious family villa',
    descriptionAr: 'فيلا عائلية واسعة',
    type: 'villa',
    status: 'for_sale',
    price: 1800000,
    currency: 'SAR',
    area: 380,
    bedrooms: 4,
    bathrooms: 3,
    location: {
      address: 'Al Yasmin',
      addressAr: 'الياسمين',
      city: 'Riyadh',
      cityAr: 'الرياض',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
    },
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    features: ['Garden', 'Garage', 'Maid Room', 'Storage'],
    ownerId: '4',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

const MAX_COMPARE = 4;

// Estimated rental rates by property type (annual % of property value)
const RENTAL_YIELD_ESTIMATES: Record<string, number> = {
  villa: 0.05,
  apartment: 0.06,
  office: 0.08,
  land: 0.02,
  warehouse: 0.07,
  industrial: 0.08,
};

function ComparePage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [compareList, setCompareList] = useState<Property[]>(mockCompareProperties);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFinancialSettings, setShowFinancialSettings] = useState(false);
  const [showFinancialSection, setShowFinancialSection] = useState(true);

  // Financial calculation settings
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTermYears, setLoanTermYears] = useState(25);

  // Calculate financial metrics for each property
  const financialMetrics = useMemo(() => {
    return compareList.map((property) => {
      const downPayment = (property.price * downPaymentPercent) / 100;
      const loanAmount = property.price - downPayment;

      const mortgage = calculateMortgage({
        principal: loanAmount,
        annualRate: interestRate / 100,
        termYears: loanTermYears,
      });

      const pricePerSqm = calculatePricePerSqm(property.price, property.area);

      // Estimate annual rental income based on property type
      const rentalYieldRate = RENTAL_YIELD_ESTIMATES[property.type] || 0.05;
      const estimatedAnnualRent = property.price * rentalYieldRate;
      const rentalYield = calculateRentalYield(estimatedAnnualRent, property.price);

      // Cash flow (annual rent - annual mortgage payments)
      const annualMortgagePayment = mortgage.monthlyPayment * 12;
      const annualCashFlow = estimatedAnnualRent - annualMortgagePayment;

      // Investment score (simple scoring based on multiple factors)
      let investmentScore = 50; // Base score
      if (pricePerSqm < 5000) investmentScore += 15;
      else if (pricePerSqm < 8000) investmentScore += 10;
      else if (pricePerSqm < 12000) investmentScore += 5;

      if (rentalYield > 7) investmentScore += 20;
      else if (rentalYield > 5) investmentScore += 10;
      else if (rentalYield > 3) investmentScore += 5;

      if (annualCashFlow > 0) investmentScore += 15;

      investmentScore = Math.min(100, Math.max(0, investmentScore));

      return {
        propertyId: property.id,
        downPayment,
        loanAmount,
        monthlyPayment: mortgage.monthlyPayment,
        totalInterest: mortgage.totalInterest,
        pricePerSqm,
        estimatedAnnualRent,
        rentalYield,
        annualCashFlow,
        investmentScore,
      };
    });
  }, [compareList, downPaymentPercent, interestRate, loanTermYears]);

  const statusLabels: Record<PropertyStatus, string> = {
    for_sale: t('property.forSale'),
    for_rent: t('property.forRent'),
    sold: isArabic ? 'تم البيع' : 'Sold',
    rented: isArabic ? 'تم التأجير' : 'Rented',
  };

  const statusVariants: Record<PropertyStatus, BadgeProps['variant']> = {
    for_sale: 'primary',
    for_rent: 'success',
    sold: 'error',
    rented: 'warning',
  };

  const availableToAdd = mockAvailableProperties.filter(
    (p) =>
      !compareList.find((c) => c.id === p.id) &&
      (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.titleAr.includes(searchQuery))
  );

  const addToCompare = (property: Property) => {
    if (compareList.length < MAX_COMPARE) {
      setCompareList([...compareList, property]);
      setShowAddModal(false);
      setSearchQuery('');
    }
  };

  const removeFromCompare = (id: string) => {
    setCompareList(compareList.filter((p) => p.id !== id));
  };

  // Get all unique features from compared properties
  const allFeatures = Array.from(
    new Set(compareList.flatMap((p) => p.features))
  ).sort();

  // Comparison rows
  const comparisonRows = [
    {
      label: t('property.price'),
      render: (p: Property) => (
        <span className="font-bold text-primary">
          {formatPrice(p.price, p.currency, isArabic ? 'ar-SA' : 'en-US')}
        </span>
      ),
    },
    {
      label: t('property.type'),
      render: (p: Property) => t(`property.${p.type}`),
    },
    {
      label: t('property.area'),
      render: (p: Property) => `${formatArea(p.area, isArabic ? 'ar-SA' : 'en-US')} ${t('property.sqm')}`,
    },
    {
      label: t('property.bedrooms'),
      render: (p: Property) => p.bedrooms ?? '-',
    },
    {
      label: t('property.bathrooms'),
      render: (p: Property) => p.bathrooms ?? '-',
    },
    {
      label: t('property.location'),
      render: (p: Property) => (isArabic ? p.location.cityAr : p.location.city),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.compare')}</h1>
          <p className="text-text-secondary mt-1">
            {isArabic
              ? `مقارنة ${compareList.length} من ${MAX_COMPARE} عقارات`
              : `Comparing ${compareList.length} of ${MAX_COMPARE} properties`}
          </p>
        </div>
        {compareList.length < MAX_COMPARE && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-5 h-5" />
            {isArabic ? 'إضافة عقار' : 'Add Property'}
          </Button>
        )}
      </div>

      {/* Financial Settings Panel */}
      {compareList.length > 0 && (
        <Card>
          <button
            onClick={() => setShowFinancialSettings(!showFinancialSettings)}
            className="w-full flex items-center justify-between p-4 hover:bg-background-tertiary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-start">
                <h3 className="font-semibold">
                  {isArabic ? 'إعدادات التمويل' : 'Financial Settings'}
                </h3>
                <p className="text-sm text-text-muted">
                  {isArabic
                    ? `دفعة أولى ${downPaymentPercent}% • فائدة ${interestRate}% • ${loanTermYears} سنة`
                    : `${downPaymentPercent}% down • ${interestRate}% rate • ${loanTermYears} years`}
                </p>
              </div>
            </div>
            {showFinancialSettings ? (
              <ChevronUp className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </button>

          {showFinancialSettings && (
            <CardContent className="border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Slider
                  label={isArabic ? 'الدفعة الأولى' : 'Down Payment'}
                  min={0}
                  max={50}
                  step={5}
                  value={downPaymentPercent}
                  onChange={setDownPaymentPercent}
                  formatValue={(v) => `${v}%`}
                />
                <Slider
                  label={isArabic ? 'معدل الفائدة' : 'Interest Rate'}
                  min={1}
                  max={15}
                  step={0.25}
                  value={interestRate}
                  onChange={setInterestRate}
                  formatValue={(v) => `${v}%`}
                />
                <Slider
                  label={isArabic ? 'مدة القرض' : 'Loan Term'}
                  min={5}
                  max={30}
                  step={5}
                  value={loanTermYears}
                  onChange={setLoanTermYears}
                  formatValue={(v) => `${v} ${isArabic ? 'سنة' : 'years'}`}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Comparison Content */}
      {compareList.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background-tertiary mb-4">
              <GitCompare className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isArabic ? 'لا توجد عقارات للمقارنة' : 'No properties to compare'}
            </h3>
            <p className="text-text-secondary mb-6">
              {isArabic
                ? 'أضف عقارات لمقارنتها جنباً إلى جنب'
                : 'Add properties to compare them side by side'}
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-5 h-5" />
              {isArabic ? 'إضافة عقار' : 'Add Property'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            {/* Property Cards Header */}
            <thead>
              <tr>
                <th className="w-48 p-2"></th>
                {compareList.map((property) => (
                  <th key={property.id} className="p-2 align-top">
                    <Card className="relative overflow-hidden">
                      <button
                        onClick={() => removeFromCompare(property.id)}
                        className="absolute top-2 end-2 z-10 p-1.5 rounded-full bg-background/80 hover:bg-error hover:text-white transition-colors"
                        aria-label="Remove from compare"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="aspect-video">
                        <img
                          src={property.images[0]}
                          alt={isArabic ? property.titleAr : property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <Badge variant={statusVariants[property.status]} size="sm">
                          {statusLabels[property.status]}
                        </Badge>
                        <h3 className="font-semibold mt-2 line-clamp-1">
                          {isArabic ? property.titleAr : property.title}
                        </h3>
                        <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {isArabic ? property.location.cityAr : property.location.city}
                        </p>
                      </CardContent>
                    </Card>
                  </th>
                ))}
                {/* Empty slots */}
                {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                  <th key={`empty-${i}`} className="p-2 align-top">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-background-tertiary hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-text-muted hover:text-primary"
                    >
                      <Plus className="w-8 h-8" />
                      <span className="text-sm">
                        {isArabic ? 'إضافة عقار' : 'Add Property'}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Comparison Rows */}
            <tbody>
              {comparisonRows.map((row, index) => (
                <tr
                  key={row.label}
                  className={cn(index % 2 === 0 ? 'bg-background-secondary/50' : '')}
                >
                  <td className="p-4 font-medium text-text-secondary">{row.label}</td>
                  {compareList.map((property) => (
                    <td key={property.id} className="p-4 text-center">
                      {row.render(property)}
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="p-4 text-center text-text-muted">
                      -
                    </td>
                  ))}
                </tr>
              ))}

              {/* Financial Analysis Section */}
              <tr>
                <td colSpan={MAX_COMPARE + 1} className="p-4">
                  <button
                    onClick={() => setShowFinancialSection(!showFinancialSection)}
                    className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
                  >
                    <Calculator className="w-5 h-5 text-primary" />
                    {isArabic ? 'التحليل المالي' : 'Financial Analysis'}
                    {showFinancialSection ? (
                      <ChevronUp className="w-4 h-4 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    )}
                  </button>
                </td>
              </tr>

              {showFinancialSection && (
                <>
                  {/* Price per sqm */}
                  <tr className="bg-background-secondary/50">
                    <td className="p-4 font-medium text-text-secondary">
                      {isArabic ? 'السعر/م²' : 'Price/sqm'}
                    </td>
                    {compareList.map((property) => {
                      const metrics = financialMetrics.find((m) => m.propertyId === property.id);
                      const minPrice = Math.min(...financialMetrics.map((m) => m.pricePerSqm));
                      const isLowest = metrics?.pricePerSqm === minPrice;
                      return (
                        <td key={property.id} className="p-4 text-center">
                          <span className={cn(isLowest && 'text-green-500 font-semibold')}>
                            {formatCurrency(metrics?.pricePerSqm || 0)}
                          </span>
                          {isLowest && (
                            <Badge variant="success" size="sm" className="ms-2">
                              {isArabic ? 'الأفضل' : 'Best'}
                            </Badge>
                          )}
                        </td>
                      );
                    })}
                    {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="p-4 text-center text-text-muted">-</td>
                    ))}
                  </tr>

                  {/* Monthly Payment */}
                  <tr>
                    <td className="p-4 font-medium text-text-secondary">
                      {isArabic ? 'القسط الشهري' : 'Monthly Payment'}
                    </td>
                    {compareList.map((property) => {
                      const metrics = financialMetrics.find((m) => m.propertyId === property.id);
                      const minPayment = Math.min(...financialMetrics.map((m) => m.monthlyPayment));
                      const isLowest = metrics?.monthlyPayment === minPayment;
                      return (
                        <td key={property.id} className="p-4 text-center">
                          <span className={cn(isLowest && 'text-green-500 font-semibold')}>
                            {formatCurrency(metrics?.monthlyPayment || 0)}
                          </span>
                        </td>
                      );
                    })}
                    {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="p-4 text-center text-text-muted">-</td>
                    ))}
                  </tr>

                  {/* Down Payment */}
                  <tr className="bg-background-secondary/50">
                    <td className="p-4 font-medium text-text-secondary">
                      {isArabic ? 'الدفعة الأولى' : 'Down Payment'}
                    </td>
                    {compareList.map((property) => {
                      const metrics = financialMetrics.find((m) => m.propertyId === property.id);
                      return (
                        <td key={property.id} className="p-4 text-center">
                          {formatCurrency(metrics?.downPayment || 0)}
                        </td>
                      );
                    })}
                    {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="p-4 text-center text-text-muted">-</td>
                    ))}
                  </tr>

                  {/* Total Interest */}
                  <tr>
                    <td className="p-4 font-medium text-text-secondary">
                      {isArabic ? 'إجمالي الفائدة' : 'Total Interest'}
                    </td>
                    {compareList.map((property) => {
                      const metrics = financialMetrics.find((m) => m.propertyId === property.id);
                      return (
                        <td key={property.id} className="p-4 text-center text-red-400">
                          {formatCurrency(metrics?.totalInterest || 0)}
                        </td>
                      );
                    })}
                    {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="p-4 text-center text-text-muted">-</td>
                    ))}
                  </tr>

                  {/* Rental Yield */}
                  <tr className="bg-background-secondary/50">
                    <td className="p-4 font-medium text-text-secondary">
                      {isArabic ? 'العائد الإيجاري' : 'Rental Yield'}
                    </td>
                    {compareList.map((property) => {
                      const metrics = financialMetrics.find((m) => m.propertyId === property.id);
                      const maxYield = Math.max(...financialMetrics.map((m) => m.rentalYield));
                      const isHighest = metrics?.rentalYield === maxYield;
                      return (
                        <td key={property.id} className="p-4 text-center">
                          <span className={cn(isHighest && 'text-green-500 font-semibold')}>
                            {formatPercentage(metrics?.rentalYield || 0)}
                          </span>
                          {isHighest && (
                            <Badge variant="success" size="sm" className="ms-2">
                              {isArabic ? 'الأعلى' : 'Best'}
                            </Badge>
                          )}
                        </td>
                      );
                    })}
                    {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="p-4 text-center text-text-muted">-</td>
                    ))}
                  </tr>

                  {/* Annual Cash Flow */}
                  <tr>
                    <td className="p-4 font-medium text-text-secondary">
                      {isArabic ? 'التدفق النقدي السنوي' : 'Annual Cash Flow'}
                    </td>
                    {compareList.map((property) => {
                      const metrics = financialMetrics.find((m) => m.propertyId === property.id);
                      const cashFlow = metrics?.annualCashFlow || 0;
                      return (
                        <td key={property.id} className="p-4 text-center">
                          <span className={cn(cashFlow >= 0 ? 'text-green-500' : 'text-red-400')}>
                            {cashFlow >= 0 ? '+' : ''}{formatCurrency(cashFlow)}
                          </span>
                        </td>
                      );
                    })}
                    {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="p-4 text-center text-text-muted">-</td>
                    ))}
                  </tr>

                  {/* Investment Score */}
                  <tr className="bg-background-secondary/50">
                    <td className="p-4 font-medium text-text-secondary">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        {isArabic ? 'نقاط الاستثمار' : 'Investment Score'}
                      </div>
                    </td>
                    {compareList.map((property) => {
                      const metrics = financialMetrics.find((m) => m.propertyId === property.id);
                      const score = metrics?.investmentScore || 0;
                      const maxScore = Math.max(...financialMetrics.map((m) => m.investmentScore));
                      const isHighest = score === maxScore;
                      const scoreColor = score >= 70 ? 'text-green-500' : score >= 50 ? 'text-primary' : 'text-red-400';
                      return (
                        <td key={property.id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-background-tertiary rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full', score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-primary' : 'bg-red-400')}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={cn('font-semibold', scoreColor)}>{score}</span>
                            {isHighest && compareList.length > 1 && (
                              <Badge variant="primary" size="sm">
                                {isArabic ? 'الأفضل' : 'Top'}
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="p-4 text-center text-text-muted">-</td>
                    ))}
                  </tr>
                </>
              )}

              {/* Features Section */}
              <tr>
                <td colSpan={MAX_COMPARE + 1} className="p-4">
                  <h3 className="font-semibold">
                    {isArabic ? 'المميزات' : 'Features'}
                  </h3>
                </td>
              </tr>
              {allFeatures.map((feature, index) => (
                <tr
                  key={feature}
                  className={cn(index % 2 === 0 ? 'bg-background-secondary/50' : '')}
                >
                  <td className="p-4 text-text-secondary">{feature}</td>
                  {compareList.map((property) => (
                    <td key={property.id} className="p-4 text-center">
                      {property.features.includes(feature) ? (
                        <Check className="w-5 h-5 text-success mx-auto" />
                      ) : (
                        <Minus className="w-5 h-5 text-text-muted mx-auto" />
                      )}
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="p-4 text-center">
                      <Minus className="w-5 h-5 text-text-muted mx-auto" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Property Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSearchQuery('');
        }}
        title={isArabic ? 'إضافة عقار للمقارنة' : 'Add Property to Compare'}
        size="lg"
      >
        <div className="space-y-4">
          <SearchBar
            placeholder={isArabic ? 'البحث عن عقار...' : 'Search properties...'}
            onSearch={setSearchQuery}
            defaultValue={searchQuery}
          />

          <div className="max-h-96 overflow-y-auto space-y-2">
            {availableToAdd.length === 0 ? (
              <p className="text-center text-text-muted py-8">
                {isArabic ? 'لا توجد عقارات متاحة' : 'No properties available'}
              </p>
            ) : (
              availableToAdd.map((property) => (
                <button
                  key={property.id}
                  onClick={() => addToCompare(property)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-background-tertiary transition-colors text-start"
                >
                  <img
                    src={property.images[0]}
                    alt={isArabic ? property.titleAr : property.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {isArabic ? property.titleAr : property.title}
                    </h4>
                    <p className="text-sm text-text-muted">
                      {isArabic ? property.location.cityAr : property.location.city}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {formatPrice(property.price, property.currency, isArabic ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-primary flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export { ComparePage };
