import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';
import { Select, type SelectOption } from './Select';
import type { PropertyFilters, PropertyType, PropertyStatus } from '@/types';

export interface FilterPanelProps {
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
  onReset: () => void;
  className?: string;
}

function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  className,
}: FilterPanelProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

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
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5+' },
  ];

  const updateFilter = <K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K]
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  );

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
          {hasActiveFilters && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-background text-xs font-medium">
              Active
            </span>
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
              placeholder={t('property.type')}
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
              placeholder={t('property.status', 'Status')}
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
              label={`${t('property.price')} (Min)`}
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
              label={`${t('property.price')} (Max)`}
              type="number"
              placeholder="1,000,000"
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
              label={`${t('property.area')} (Min)`}
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
              label={`${t('property.area')} (Max)`}
              type="number"
              placeholder="500"
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
              placeholder={t('property.bedrooms')}
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
              placeholder={t('property.bathrooms')}
              value={filters.bathrooms?.toString() || ''}
              onChange={(e) =>
                updateFilter(
                  'bathrooms',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {hasActiveFilters && (
              <Button variant="ghost" onClick={onReset}>
                <X className="w-4 h-4" />
                {t('common.cancel')}
              </Button>
            )}
            <Button variant="primary" onClick={() => setIsExpanded(false)}>
              {t('common.filter')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { FilterPanel };
