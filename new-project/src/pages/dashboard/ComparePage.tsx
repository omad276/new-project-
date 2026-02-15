import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitCompare,
  Plus,
  X,
  Check,
  Minus,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { cn, formatPrice, formatArea } from '@/lib/utils';
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

function ComparePage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [compareList, setCompareList] = useState<Property[]>(mockCompareProperties);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
