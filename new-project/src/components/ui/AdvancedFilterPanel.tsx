import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Calculator,
  TrendingUp,
  Map,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';
import { Select, type SelectOption } from './Select';
import { Slider } from './Slider';
import { Badge } from './Badge';
import type { PropertyFilters, PropertyType, PropertyStatus } from '@/types';

export interface AdvancedFilterPanelProps {
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
  onReset: () => void;
  onMapSearchToggle?: () => void;
  isMapSearchActive?: boolean;
  className?: string;
}

function AdvancedFilterPanel({
  filters,
  onFilterChange,
  onReset,
  onMapSearchToggle,
  isMapSearchActive = false,
  className,
}: AdvancedFilterPanelProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const propertyTypes: SelectOption[] = [
    { value: 'apartment', label: t('property.apartment', 'Apartment') },
    { value: 'villa', label: t('property.villa', 'Villa') },
    { value: 'office', label: t('property.office', 'Office') },
    { value: 'land', label: t('property.land', 'Land') },
    { value: 'building', label: t('property.building', 'Building') },
    { value: 'warehouse', label: t('property.warehouse', 'Warehouse') },
    { value: 'factory', label: t('property.factory', 'Factory') },
    { value: 'industrial_land', label: t('property.industrialLand', 'Industrial Land') },
  ];

  const propertyStatuses: SelectOption[] = [
    { value: 'for_sale', label: t('property.forSale', 'For Sale') },
    { value: 'for_rent', label: t('property.forRent', 'For Rent') },
    { value: 'off_plan', label: t('property.offPlan', 'Off-Plan') },
    { value: 'investment', label: t('property.investment', 'Investment') },
  ];

  const bedroomOptions: SelectOption[] = [
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
  ];

  const updateFilter = <K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K]
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'polygon') return Array.isArray(value) && value.length > 0;
    return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0);
  });

  const hasAdvancedFilters =
    filters.minPricePerSqm !== undefined ||
    filters.maxPricePerSqm !== undefined ||
    filters.minRentalYield !== undefined ||
    filters.maxRentalYield !== undefined ||
    (filters.polygon && filters.polygon.length > 0);

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'polygon') return Array.isArray(value) && value.length > 0;
    return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0);
  }).length;

  return (
    <div className={cn('bg-background-secondary rounded-xl', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <span className="font-medium text-text-primary">{t('common.filter')}</span>
          {activeFilterCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted" />
        )}
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-background-tertiary pt-4">
          {/* Property Type & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('property.type')}
              options={propertyTypes}
              placeholder={isArabic ? 'جميع الأنواع' : 'All Types'}
              value={filters.type?.[0] || ''}
              onChange={(e) =>
                updateFilter(
                  'type',
                  e.target.value ? [e.target.value as PropertyType] : undefined
                )
              }
            />
            <Select
              label={t('property.status', 'Status')}
              options={propertyStatuses}
              placeholder={isArabic ? 'جميع الحالات' : 'All Statuses'}
              value={filters.status?.[0] || ''}
              onChange={(e) =>
                updateFilter(
                  'status',
                  e.target.value ? [e.target.value as PropertyStatus] : undefined
                )
              }
            />
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`${t('property.price')} (${isArabic ? 'الحد الأدنى' : 'Min'})`}
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) =>
                updateFilter(
                  'minPrice',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
            <Input
              label={`${t('property.price')} (${isArabic ? 'الحد الأقصى' : 'Max'})`}
              type="number"
              placeholder="5,000,000"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                updateFilter(
                  'maxPrice',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          {/* Area Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`${t('property.area')} (${isArabic ? 'الحد الأدنى' : 'Min'})`}
              type="number"
              placeholder="0"
              value={filters.minArea || ''}
              onChange={(e) =>
                updateFilter(
                  'minArea',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
            <Input
              label={`${t('property.area')} (${isArabic ? 'الحد الأقصى' : 'Max'})`}
              type="number"
              placeholder="1,000"
              value={filters.maxArea || ''}
              onChange={(e) =>
                updateFilter(
                  'maxArea',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('property.bedrooms')}
              options={bedroomOptions}
              placeholder={isArabic ? 'الكل' : 'Any'}
              value={filters.bedrooms?.toString() || ''}
              onChange={(e) =>
                updateFilter(
                  'bedrooms',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
            <Select
              label={t('property.bathrooms')}
              options={bedroomOptions}
              placeholder={isArabic ? 'الكل' : 'Any'}
              value={filters.bathrooms?.toString() || ''}
              onChange={(e) =>
                updateFilter(
                  'bathrooms',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 bg-background rounded-lg hover:bg-background-tertiary transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {isArabic ? 'فلاتر متقدمة' : 'Advanced Filters'}
              </span>
              {hasAdvancedFilters && (
                <Badge variant="success" size="sm">
                  {isArabic ? 'نشط' : 'Active'}
                </Badge>
              )}
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-muted" />
            )}
          </button>

          {/* Advanced Filters Content */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-background rounded-lg border border-border">
              {/* Price per sqm */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {isArabic ? 'السعر لكل م²' : 'Price per sqm'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder={isArabic ? 'الحد الأدنى' : 'Min'}
                    value={filters.minPricePerSqm || ''}
                    onChange={(e) =>
                      updateFilter(
                        'minPricePerSqm',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder={isArabic ? 'الحد الأقصى' : 'Max'}
                    value={filters.maxPricePerSqm || ''}
                    onChange={(e) =>
                      updateFilter(
                        'maxPricePerSqm',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {isArabic
                    ? 'تصفية العقارات حسب قيمة السعر/المساحة'
                    : 'Filter properties by price-to-area value'}
                </p>
              </div>

              {/* Rental Yield */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {isArabic ? 'العائد الإيجاري المتوقع' : 'Est. Rental Yield'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Slider
                      min={0}
                      max={15}
                      step={0.5}
                      value={filters.minRentalYield || 0}
                      onChange={(v) =>
                        updateFilter('minRentalYield', v > 0 ? v : undefined)
                      }
                      formatValue={(v) => `${v}%`}
                      label={isArabic ? 'الحد الأدنى' : 'Min'}
                    />
                  </div>
                  <div>
                    <Slider
                      min={0}
                      max={15}
                      step={0.5}
                      value={filters.maxRentalYield || 15}
                      onChange={(v) =>
                        updateFilter('maxRentalYield', v < 15 ? v : undefined)
                      }
                      formatValue={(v) => `${v}%`}
                      label={isArabic ? 'الحد الأقصى' : 'Max'}
                    />
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {isArabic
                    ? 'تصفية حسب العائد الإيجاري السنوي المقدر'
                    : 'Filter by estimated annual rental return'}
                </p>
              </div>

              {/* Map Search */}
              {onMapSearchToggle && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Map className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      {isArabic ? 'البحث على الخريطة' : 'Map Search'}
                    </span>
                  </div>
                  <Button
                    variant={isMapSearchActive ? 'primary' : 'outline'}
                    onClick={onMapSearchToggle}
                    className="w-full"
                  >
                    {isMapSearchActive ? (
                      <>
                        <X className="w-4 h-4" />
                        {isArabic ? 'إلغاء البحث على الخريطة' : 'Cancel Map Search'}
                      </>
                    ) : (
                      <>
                        <Map className="w-4 h-4" />
                        {isArabic ? 'رسم منطقة البحث' : 'Draw Search Area'}
                      </>
                    )}
                  </Button>
                  {filters.polygon && filters.polygon.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="success" size="sm">
                        {isArabic ? 'منطقة محددة' : 'Area Selected'}
                      </Badge>
                      <button
                        onClick={() => updateFilter('polygon', undefined)}
                        className="text-xs text-error hover:underline"
                      >
                        {isArabic ? 'مسح' : 'Clear'}
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-text-muted mt-1">
                    {isArabic
                      ? 'ارسم شكلاً على الخريطة لتحديد منطقة البحث'
                      : 'Draw a shape on the map to define your search area'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                <X className="w-4 h-4" />
                {isArabic ? 'مسح الكل' : 'Clear All'}
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="primary" onClick={() => setIsExpanded(false)}>
              {isArabic ? 'تطبيق الفلاتر' : 'Apply Filters'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { AdvancedFilterPanel };
