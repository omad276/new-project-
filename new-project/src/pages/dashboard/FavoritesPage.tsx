import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Heart, Search, Grid3X3, List, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

// Mock favorites data
const mockFavorites: Property[] = [
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
    ownerId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
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
    ownerId: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
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
    features: [],
    ownerId: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Beachfront Villa',
    titleAr: 'فيلا على البحر',
    description: 'Beachfront property',
    descriptionAr: 'عقار على البحر',
    type: 'villa',
    status: 'for_rent',
    price: 25000,
    currency: 'SAR',
    area: 500,
    bedrooms: 6,
    bathrooms: 5,
    location: {
      address: 'Obhur',
      addressAr: 'أبحر',
      city: 'Jeddah',
      cityAr: 'جدة',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
    },
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    features: [],
    ownerId: '5',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

type ViewMode = 'grid' | 'list';

function FavoritesPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [favorites, setFavorites] = useState(mockFavorites);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [propertyToRemove, setPropertyToRemove] = useState<string | null>(null);

  const filteredFavorites = favorites.filter(
    (property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.titleAr.includes(searchQuery) ||
      property.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.cityAr.includes(searchQuery)
  );

  const handleRemoveFavorite = (id: string) => {
    setPropertyToRemove(id);
    setShowRemoveModal(true);
  };

  const confirmRemove = () => {
    if (propertyToRemove) {
      setFavorites(favorites.filter((p) => p.id !== propertyToRemove));
    }
    setShowRemoveModal(false);
    setPropertyToRemove(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.favorites')}</h1>
        <p className="text-text-secondary mt-1">
          {isArabic
            ? `${favorites.length} عقارات محفوظة`
            : `${favorites.length} saved properties`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'البحث في المفضلة...' : 'Search favorites...'}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex border border-background-tertiary rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2.5 transition-colors',
              viewMode === 'grid'
                ? 'bg-primary text-background'
                : 'hover:bg-background-secondary'
            )}
            aria-label="Grid view"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2.5 transition-colors',
              viewMode === 'list'
                ? 'bg-primary text-background'
                : 'hover:bg-background-secondary'
            )}
            aria-label="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background-tertiary mb-4">
              <Heart className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery
                ? isArabic
                  ? 'لا توجد نتائج'
                  : 'No results found'
                : isArabic
                ? 'لا توجد عقارات مفضلة'
                : 'No favorites yet'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchQuery
                ? isArabic
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'Try different search terms'
                : isArabic
                ? 'ابدأ بحفظ العقارات التي تعجبك'
                : 'Start saving properties you like'}
            </p>
            {!searchQuery && (
              <Link to="/properties">
                <Button>
                  {isArabic ? 'تصفح العقارات' : 'Browse Properties'}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {filteredFavorites.map((property) => (
            <div key={property.id} className="relative group">
              <PropertyCard
                property={property}
                isFavorite={true}
                onClick={(id) => console.log('View property', id)}
                onFavorite={handleRemoveFavorite}
              />
            </div>
          ))}
        </div>
      )}

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title={isArabic ? 'إزالة من المفضلة' : 'Remove from Favorites'}
        description={
          isArabic
            ? 'هل أنت متأكد من إزالة هذا العقار من المفضلة؟'
            : 'Are you sure you want to remove this property from your favorites?'
        }
      >
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowRemoveModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={confirmRemove}>
            <Trash2 className="w-4 h-4" />
            {isArabic ? 'إزالة' : 'Remove'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export { FavoritesPage };
