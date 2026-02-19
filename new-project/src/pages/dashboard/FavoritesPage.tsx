import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Heart,
  Search,
  Grid3X3,
  List,
  Trash2,
  Plus,
  FolderPlus,
  StickyNote,
  ArrowUpDown,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  CollectionCard,
  CollectionModal,
  PropertyNotesModal,
  ShareCollectionModal,
} from '@/components/favorites';
import { cn } from '@/lib/utils';
import type { Property, Collection } from '@/types';

// Mock favorites data with notes
interface FavoriteItem {
  property: Property;
  collectionId: string;
  notes?: string;
  addedAt: Date;
}

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa in Riyadh',
    titleAr: 'فيلا فاخرة في الرياض',
    description: 'Beautiful villa',
    descriptionAr: 'فيلا جميلة',
    type: 'villa',
    category: 'residential',
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
      coordinates: { type: 'Point', coordinates: [46.6753, 24.7136] },
    },
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    features: ['Pool', 'Garden'],
    featuresAr: ['مسبح', 'حديقة'],
    owner: '2',
    isActive: true,
    isFeatured: true,
    viewCount: 150,
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
    category: 'residential',
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
      coordinates: { type: 'Point', coordinates: [39.1728, 21.5433] },
    },
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    features: ['Sea View', 'Gym'],
    featuresAr: ['إطلالة بحرية', 'صالة رياضية'],
    owner: '3',
    isActive: true,
    isFeatured: false,
    viewCount: 89,
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
    category: 'residential',
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
      coordinates: { type: 'Point', coordinates: [46.6753, 24.7136] },
    },
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    features: ['Rooftop Terrace', 'Smart Home'],
    featuresAr: ['تراس على السطح', 'منزل ذكي'],
    owner: '4',
    isActive: true,
    isFeatured: true,
    viewCount: 234,
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
    category: 'residential',
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
      coordinates: { type: 'Point', coordinates: [39.1728, 21.5433] },
    },
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    features: ['Private Beach', 'Pool'],
    featuresAr: ['شاطئ خاص', 'مسبح'],
    owner: '5',
    isActive: true,
    isFeatured: false,
    viewCount: 312,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Commercial Office Space',
    titleAr: 'مكتب تجاري',
    description: 'Modern office space',
    descriptionAr: 'مساحة مكتبية حديثة',
    type: 'office',
    category: 'commercial',
    status: 'for_rent',
    price: 15000,
    currency: 'SAR',
    area: 200,
    location: {
      address: 'King Fahd Road',
      addressAr: 'طريق الملك فهد',
      city: 'Riyadh',
      cityAr: 'الرياض',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
      coordinates: { type: 'Point', coordinates: [46.6753, 24.7136] },
    },
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    features: ['Parking', 'Meeting Rooms'],
    featuresAr: ['موقف سيارات', 'قاعات اجتماعات'],
    owner: '6',
    isActive: true,
    isFeatured: false,
    viewCount: 78,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockCollections: Collection[] = [
  {
    id: 'all',
    name: 'All Favorites',
    nameAr: 'جميع المفضلة',
    color: '#C5A572',
    icon: 'heart',
    propertyIds: ['1', '2', '3', '4', '5'],
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'investment',
    name: 'Investment Properties',
    nameAr: 'عقارات للاستثمار',
    description: 'Properties with high ROI potential',
    color: '#10B981',
    icon: 'building',
    propertyIds: ['1', '3'],
    isShared: true,
    shareLink: 'https://upgreat.sa/shared/investment',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'beach',
    name: 'Beach Properties',
    nameAr: 'عقارات على البحر',
    color: '#3B82F6',
    icon: 'beach',
    propertyIds: ['2', '4'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockNotes: Record<string, string> = {
  '1': '✓ Good price for the area\n📞 Contact owner next week',
  '3': '⚠ Needs renovation estimate\n🔄 Compare with similar properties',
};

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name';

function FavoritesPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // State
  const [collections, setCollections] = useState(mockCollections);
  const [activeCollectionId, setActiveCollectionId] = useState('all');
  const [propertyNotes, setPropertyNotes] = useState(mockNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Modals
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [propertyToRemove, setPropertyToRemove] = useState<string | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesProperty, setNotesProperty] = useState<Property | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingCollection, setSharingCollection] = useState<Collection | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [movingPropertyId, setMovingPropertyId] = useState<string | null>(null);

  // Get active collection
  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let properties = mockProperties.filter((p) =>
      activeCollection?.propertyIds.includes(p.id)
    );

    // Search filter
    if (searchQuery) {
      properties = properties.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.titleAr.includes(searchQuery) ||
          property.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.cityAr.includes(searchQuery)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        properties.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        properties.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        properties.sort((a, b) =>
          isArabic
            ? a.titleAr.localeCompare(b.titleAr, 'ar')
            : a.title.localeCompare(b.title)
        );
        break;
      case 'oldest':
        properties.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'newest':
      default:
        properties.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return properties;
  }, [activeCollection, searchQuery, sortBy, isArabic]);

  // Handlers
  const handleRemoveFavorite = (id: string) => {
    setPropertyToRemove(id);
    setShowRemoveModal(true);
  };

  const confirmRemove = () => {
    if (propertyToRemove) {
      setCollections((prev) =>
        prev.map((c) => ({
          ...c,
          propertyIds: c.propertyIds.filter((id) => id !== propertyToRemove),
        }))
      );
    }
    setShowRemoveModal(false);
    setPropertyToRemove(null);
  };

  const handleSaveCollection = (data: Partial<Collection>) => {
    if (data.id) {
      // Edit existing
      setCollections((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data, updatedAt: new Date() } : c))
      );
    } else {
      // Create new
      const newCollection: Collection = {
        id: `col-${Date.now()}`,
        name: data.name || 'New Collection',
        nameAr: data.nameAr,
        description: data.description,
        color: data.color || '#C5A572',
        icon: data.icon || 'folder',
        propertyIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCollections((prev) => [...prev, newCollection]);
    }
  };

  const handleDeleteCollection = (collectionId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    if (activeCollectionId === collectionId) {
      setActiveCollectionId('all');
    }
  };

  const handleOpenNotes = (property: Property) => {
    setNotesProperty(property);
    setShowNotesModal(true);
  };

  const handleSaveNotes = (propertyId: string, notes: string) => {
    setPropertyNotes((prev) => ({
      ...prev,
      [propertyId]: notes,
    }));
  };

  const handleToggleShare = (collectionId: string, isShared: boolean) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              isShared,
              shareLink: isShared ? `https://upgreat.sa/shared/${c.id}` : undefined,
            }
          : c
      )
    );
  };

  const handleMoveToCollection = (propertyId: string, targetCollectionId: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === 'all') return c; // Don't modify 'all' collection
        if (c.id === targetCollectionId) {
          return {
            ...c,
            propertyIds: c.propertyIds.includes(propertyId)
              ? c.propertyIds
              : [...c.propertyIds, propertyId],
          };
        }
        return {
          ...c,
          propertyIds: c.propertyIds.filter((id) => id !== propertyId),
        };
      })
    );
    setShowMoveModal(false);
    setMovingPropertyId(null);
  };

  const sortOptions: { value: SortOption; label: string; labelAr: string }[] = [
    { value: 'newest', label: 'Newest First', labelAr: 'الأحدث أولاً' },
    { value: 'oldest', label: 'Oldest First', labelAr: 'الأقدم أولاً' },
    { value: 'price_asc', label: 'Price: Low to High', labelAr: 'السعر: من الأقل' },
    { value: 'price_desc', label: 'Price: High to Low', labelAr: 'السعر: من الأعلى' },
    { value: 'name', label: 'Name', labelAr: 'الاسم' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.favorites')}</h1>
          <p className="text-text-secondary mt-1">
            {isArabic
              ? `${mockProperties.length} عقارات محفوظة في ${collections.length - 1} مجموعات`
              : `${mockProperties.length} saved properties in ${collections.length - 1} collections`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCollection(null);
            setShowCollectionModal(true);
          }}
        >
          <FolderPlus className="w-4 h-4" />
          {isArabic ? 'مجموعة جديدة' : 'New Collection'}
        </Button>
      </div>

      {/* Collections */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            propertyCount={collection.propertyIds.length}
            isActive={activeCollectionId === collection.id}
            onClick={() => setActiveCollectionId(collection.id)}
            onEdit={() => {
              setEditingCollection(collection);
              setShowCollectionModal(true);
            }}
            onDelete={() => handleDeleteCollection(collection.id)}
            onShare={() => {
              setSharingCollection(collection);
              setShowShareModal(true);
            }}
            isArabic={isArabic}
          />
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'البحث في المفضلة...' : 'Search favorites...'}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>

        <div className="flex gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isArabic
                  ? sortOptions.find((o) => o.value === sortBy)?.labelAr
                  : sortOptions.find((o) => o.value === sortBy)?.label}
              </span>
            </Button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute end-0 top-full mt-1 z-20 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[180px]">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        'w-full text-start px-4 py-2 text-sm hover:bg-background-secondary transition-colors',
                        sortBy === option.value && 'text-primary bg-primary/10'
                      )}
                    >
                      {isArabic ? option.labelAr : option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
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
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
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
                  ? 'لا توجد عقارات في هذه المجموعة'
                  : 'No properties in this collection'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchQuery
                ? isArabic
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'Try different search terms'
                : isArabic
                  ? 'أضف عقارات إلى هذه المجموعة'
                  : 'Add properties to this collection'}
            </p>
            {!searchQuery && (
              <Link to="/properties">
                <Button>{isArabic ? 'تصفح العقارات' : 'Browse Properties'}</Button>
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
          {filteredProperties.map((property) => (
            <div key={property.id} className="relative group">
              <PropertyCard
                property={property}
                isFavorite={true}
                onClick={(id) => console.log('View property', id)}
                onFavorite={handleRemoveFavorite}
              />

              {/* Notes & Actions Overlay */}
              <div className="absolute top-2 end-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenNotes(property);
                  }}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    propertyNotes[property.id]
                      ? 'bg-primary text-white'
                      : 'bg-background/80 hover:bg-background text-text-primary'
                  )}
                  title={isArabic ? 'ملاحظات' : 'Notes'}
                >
                  <StickyNote className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMovingPropertyId(property.id);
                    setShowMoveModal(true);
                  }}
                  className="p-2 rounded-lg bg-background/80 hover:bg-background text-text-primary transition-colors"
                  title={isArabic ? 'نقل إلى مجموعة' : 'Move to collection'}
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Notes Badge */}
              {propertyNotes[property.id] && (
                <div className="absolute bottom-20 start-4 end-4">
                  <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 text-xs text-text-secondary line-clamp-2">
                    {propertyNotes[property.id]}
                  </div>
                </div>
              )}
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

      {/* Collection Modal */}
      <CollectionModal
        isOpen={showCollectionModal}
        onClose={() => {
          setShowCollectionModal(false);
          setEditingCollection(null);
        }}
        onSave={handleSaveCollection}
        collection={editingCollection}
        isArabic={isArabic}
      />

      {/* Notes Modal */}
      <PropertyNotesModal
        isOpen={showNotesModal}
        onClose={() => {
          setShowNotesModal(false);
          setNotesProperty(null);
        }}
        onSave={handleSaveNotes}
        property={notesProperty}
        currentNotes={notesProperty ? propertyNotes[notesProperty.id] : ''}
        isArabic={isArabic}
      />

      {/* Share Modal */}
      <ShareCollectionModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSharingCollection(null);
        }}
        onToggleShare={handleToggleShare}
        collection={sharingCollection}
        isArabic={isArabic}
      />

      {/* Move to Collection Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => {
          setShowMoveModal(false);
          setMovingPropertyId(null);
        }}
        title={isArabic ? 'نقل إلى مجموعة' : 'Move to Collection'}
      >
        <div className="space-y-2 p-4">
          {collections
            .filter((c) => c.id !== 'all')
            .map((collection) => (
              <button
                key={collection.id}
                onClick={() =>
                  movingPropertyId && handleMoveToCollection(movingPropertyId, collection.id)
                }
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                  collection.propertyIds.includes(movingPropertyId || '')
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-background-secondary hover:bg-background-tertiary'
                )}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${collection.color}20`, color: collection.color }}
                >
                  {collection.icon === 'folder'
                    ? '📁'
                    : collection.icon === 'building'
                      ? '🏢'
                      : collection.icon === 'beach'
                        ? '🏖️'
                        : '📁'}
                </div>
                <div className="text-start">
                  <p className="font-medium">
                    {isArabic && collection.nameAr ? collection.nameAr : collection.name}
                  </p>
                  <p className="text-sm text-text-muted">
                    {collection.propertyIds.length}{' '}
                    {isArabic ? 'عقار' : 'properties'}
                  </p>
                </div>
                {collection.propertyIds.includes(movingPropertyId || '') && (
                  <Badge className="ms-auto">{isArabic ? 'حالي' : 'Current'}</Badge>
                )}
              </button>
            ))}
        </div>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowMoveModal(false);
              setMovingPropertyId(null);
            }}
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export { FavoritesPage };
