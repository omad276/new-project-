import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { formatPrice } from '@/lib/utils';
import type { Property, PropertyStatus } from '@/types';
import type { BadgeProps } from '@/components/ui/Badge';

// Mock data
const mockProperties: (Property & { views: number; inquiries: number })[] = [
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
    features: [],
    ownerId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    views: 245,
    inquiries: 12,
  },
  {
    id: '2',
    title: 'Modern Apartment in Jeddah',
    titleAr: 'شقة حديثة في جدة',
    description: 'Modern apartment',
    descriptionAr: 'شقة حديثة',
    type: 'apartment',
    status: 'for_rent',
    price: 8000,
    currency: 'SAR',
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    location: {
      address: 'Corniche',
      addressAr: 'الكورنيش',
      city: 'Jeddah',
      cityAr: 'جدة',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
    },
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    features: [],
    ownerId: '1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    views: 189,
    inquiries: 8,
  },
  {
    id: '3',
    title: 'Office Space in KAFD',
    titleAr: 'مكتب في كافد',
    description: 'Premium office',
    descriptionAr: 'مكتب فاخر',
    type: 'office',
    status: 'rented',
    price: 15000,
    currency: 'SAR',
    area: 250,
    location: {
      address: 'KAFD',
      addressAr: 'كافد',
      city: 'Riyadh',
      cityAr: 'الرياض',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
    },
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    features: [],
    ownerId: '1',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-20'),
    views: 320,
    inquiries: 15,
  },
];

function MyPropertiesPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

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

  const filteredProperties = mockProperties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.titleAr.includes(searchQuery);

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && ['for_sale', 'for_rent'].includes(property.status)) ||
      (activeTab === 'inactive' && ['sold', 'rented'].includes(property.status));

    return matchesSearch && matchesTab;
  });

  const handleDelete = () => {
    console.log('Delete property:', propertyToDelete);
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.myProperties')}</h1>
          <p className="text-text-secondary mt-1">
            {isArabic
              ? `${mockProperties.length} عقارات مدرجة`
              : `${mockProperties.length} properties listed`}
          </p>
        </div>
        <Link to="/dashboard/properties/new">
          <Button>
            <Plus className="w-5 h-5" />
            {isArabic ? 'إضافة عقار' : 'Add Property'}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'البحث في العقارات...' : 'Search properties...'}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <Tabs defaultValue="all" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setActiveTab('all')}>
              {isArabic ? 'الكل' : 'All'}
            </TabsTrigger>
            <TabsTrigger value="active" onClick={() => setActiveTab('active')}>
              {isArabic ? 'نشط' : 'Active'}
            </TabsTrigger>
            <TabsTrigger value="inactive" onClick={() => setActiveTab('inactive')}>
              {isArabic ? 'منتهي' : 'Inactive'}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2">
              {isArabic ? 'لا توجد عقارات' : 'No properties found'}
            </h3>
            <p className="text-text-secondary mb-6">
              {isArabic
                ? 'ابدأ بإضافة عقارك الأول'
                : 'Start by adding your first property'}
            </p>
            <Link to="/dashboard/properties/new">
              <Button>
                <Plus className="w-5 h-5" />
                {isArabic ? 'إضافة عقار' : 'Add Property'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={property.images[0]}
                      alt={isArabic ? property.titleAr : property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={statusVariants[property.status]}>
                            {statusLabels[property.status]}
                          </Badge>
                          <Badge variant="default">
                            {t(`property.${property.type}`)}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg">
                          {isArabic ? property.titleAr : property.title}
                        </h3>
                        <p className="text-text-secondary text-sm">
                          {isArabic
                            ? `${property.location.cityAr}، ${property.location.countryAr}`
                            : `${property.location.city}, ${property.location.country}`}
                        </p>
                      </div>

                      {/* Actions Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setSelectedProperty(
                              selectedProperty === property.id ? null : property.id
                            )
                          }
                          className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {selectedProperty === property.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setSelectedProperty(null)}
                            />
                            <div className="absolute top-full end-0 mt-1 w-40 py-1 rounded-lg bg-background-secondary border border-background-tertiary shadow-lg z-20">
                              <Link
                                to={`/properties/${property.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-background-tertiary transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                {isArabic ? 'عرض' : 'View'}
                              </Link>
                              <Link
                                to={`/dashboard/properties/${property.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-background-tertiary transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                {t('common.edit')}
                              </Link>
                              <button
                                onClick={() => {
                                  setPropertyToDelete(property.id);
                                  setShowDeleteModal(true);
                                  setSelectedProperty(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                {t('common.delete')}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-background-tertiary">
                      <div className="text-xl font-bold text-primary">
                        {formatPrice(property.price, property.currency, isArabic ? 'ar-SA' : 'en-US')}
                        {property.status === 'for_rent' && (
                          <span className="text-sm text-text-muted font-normal">
                            {' '}/ {isArabic ? 'شهرياً' : 'mo'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-text-secondary">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{property.views}</span>
                      </div>
                      <div className="flex items-center gap-1 text-text-secondary">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">{property.inquiries}</span>
                      </div>
                      <div className="text-xs text-text-muted ms-auto">
                        {isArabic ? 'أضيف في ' : 'Listed '}
                        {property.createdAt.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={isArabic ? 'حذف العقار' : 'Delete Property'}
        description={
          isArabic
            ? 'هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.'
            : 'Are you sure you want to delete this property? This action cannot be undone.'
        }
      >
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export { MyPropertiesPage };
