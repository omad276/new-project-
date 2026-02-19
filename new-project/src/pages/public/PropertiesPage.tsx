import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid3X3, List, SlidersHorizontal, Map, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { AdvancedFilterPanel } from '@/components/ui/AdvancedFilterPanel';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useProperties } from '@/hooks/useProperties';
import { PropertiesMap, type MapViewMode } from '@/components/map';
import type { PropertyFilters, PropertyType, PropertyStatus, PropertyQueryParams } from '@/types';
import type { Feature } from 'geojson';

type ViewMode = 'grid' | 'list' | 'map';

function PropertiesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isArabic = i18n.language === 'ar';

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
  const [isMapSearchActive, setIsMapSearchActive] = useState(false);
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>('clusters');

  // Parse initial params from URL
  const getInitialParams = (): PropertyQueryParams => {
    const typeParam = searchParams.get('type');
    const statusParam = searchParams.get('status');
    const q = searchParams.get('q');
    const sort = searchParams.get('sort') as PropertyQueryParams['sort'];
    const page = searchParams.get('page');

    return {
      type: typeParam ? [typeParam as PropertyType] : undefined,
      status: statusParam ? [statusParam as PropertyStatus] : undefined,
      q: q || undefined,
      sort: sort || 'newest',
      page: page ? parseInt(page, 10) : 1,
      limit: 12,
    };
  };

  const {
    properties,
    pagination,
    isLoading,
    error,
    params,
    updateFilters,
    setPage,
    setSort,
    search,
  } = useProperties(getInitialParams());

  // Sync URL with params
  useEffect(() => {
    const newParams = new URLSearchParams();

    if (params.q) newParams.set('q', params.q);
    if (params.type?.length) params.type.forEach((t) => newParams.append('type', t));
    if (params.status?.length) params.status.forEach((s) => newParams.append('status', s));
    if (params.sort && params.sort !== 'newest') newParams.set('sort', params.sort);
    if (params.page && params.page > 1) newParams.set('page', params.page.toString());
    if (params.minPrice) newParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) newParams.set('maxPrice', params.maxPrice.toString());
    if (params.minArea) newParams.set('minArea', params.minArea.toString());
    if (params.maxArea) newParams.set('maxArea', params.maxArea.toString());
    if (params.bedrooms) newParams.set('bedrooms', params.bedrooms.toString());
    if (params.bathrooms) newParams.set('bathrooms', params.bathrooms.toString());
    if (params.city) newParams.set('city', params.city);

    setSearchParams(newParams, { replace: true });
  }, [params, setSearchParams]);

  const sortOptions = [
    { value: 'newest', label: isArabic ? 'الأحدث' : 'Newest' },
    { value: 'oldest', label: isArabic ? 'الأقدم' : 'Oldest' },
    { value: 'price_asc', label: isArabic ? 'السعر: الأقل' : 'Price: Low to High' },
    { value: 'price_desc', label: isArabic ? 'السعر: الأعلى' : 'Price: High to Low' },
    { value: 'area_asc', label: isArabic ? 'المساحة: الأصغر' : 'Area: Small to Large' },
    { value: 'area_desc', label: isArabic ? 'المساحة: الأكبر' : 'Area: Large to Small' },
  ];

  // Build current filters for FilterPanel - must be defined before callbacks that use it
  const currentFilters: PropertyFilters = {
    type: params.type,
    status: params.status,
    category: params.category,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    minArea: params.minArea,
    maxArea: params.maxArea,
    bedrooms: params.bedrooms,
    bathrooms: params.bathrooms,
    city: params.city,
    minPricePerSqm: params.minPricePerSqm,
    maxPricePerSqm: params.maxPricePerSqm,
    minRentalYield: params.minRentalYield,
    maxRentalYield: params.maxRentalYield,
    polygon: params.polygon,
  };

  const handleSearch = (query: string) => {
    search(query);
  };

  const handleFilterChange = (newFilters: PropertyFilters) => {
    updateFilters(newFilters);
  };

  const handleResetFilters = () => {
    updateFilters({
      type: undefined,
      status: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minArea: undefined,
      maxArea: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      city: undefined,
      minPricePerSqm: undefined,
      maxPricePerSqm: undefined,
      minRentalYield: undefined,
      maxRentalYield: undefined,
      polygon: undefined,
    });
    search('');
    setIsMapSearchActive(false);
  };

  // Handle polygon draw for map search
  const handleDrawCreate = useCallback((features: Feature[]) => {
    if (features.length > 0 && features[0].geometry.type === 'Polygon') {
      const coordinates = (features[0].geometry as GeoJSON.Polygon).coordinates[0];
      const polygon = coordinates.map((coord) => [coord[0], coord[1]]);
      updateFilters({ ...currentFilters, polygon });
      setIsMapSearchActive(false);
    }
  }, [currentFilters, updateFilters]);

  const handleMapSearchToggle = useCallback(() => {
    if (isMapSearchActive) {
      setIsMapSearchActive(false);
    } else {
      setViewMode('map');
      setIsMapSearchActive(true);
    }
  }, [isMapSearchActive]);

  const handlePropertyClick = (id: string) => {
    navigate(`/properties/${id}`);
  };

  const handleFavorite = (id: string) => {
    console.log('Toggle favorite', id);
    // TODO: Implement favorite functionality
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/properties/${id}`;
    if (navigator.share) {
      navigator.share({ title: 'Property', url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const hasPolygonFilter = currentFilters.polygon && currentFilters.polygon.length > 0;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'تصفح العقارات' : 'Browse Properties'}
          </h1>
          <p className="text-text-secondary">
            {isArabic
              ? `${pagination.total} عقار متاح`
              : `${pagination.total} properties available`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <AdvancedFilterPanel
              filters={currentFilters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              onMapSearchToggle={handleMapSearchToggle}
              isMapSearchActive={isMapSearchActive}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search & Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <SearchBar
                  placeholder={isArabic ? 'ابحث عن عقار...' : 'Search properties...'}
                  defaultValue={params.q || ''}
                  onSearch={handleSearch}
                />
              </div>

              <div className="flex gap-2">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>

                {/* Sort */}
                <Select
                  options={sortOptions}
                  value={params.sort || 'newest'}
                  onChange={(e) => setSort(e.target.value as PropertyQueryParams['sort'])}
                  className="w-40"
                />

                {/* View Toggle */}
                <div className="flex border border-background-tertiary rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 transition-colors',
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
                      'p-2 transition-colors',
                      viewMode === 'list'
                        ? 'bg-primary text-background'
                        : 'hover:bg-background-secondary'
                    )}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'map'
                        ? 'bg-primary text-background'
                        : 'hover:bg-background-secondary'
                    )}
                    aria-label="Map view"
                  >
                    <Map className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6">
                <AdvancedFilterPanel
                  filters={currentFilters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  onMapSearchToggle={handleMapSearchToggle}
                  isMapSearchActive={isMapSearchActive}
                />
              </div>
            )}

            {/* Map Search Active Banner */}
            {isMapSearchActive && (
              <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Pencil className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium text-text-primary block">
                      {isArabic ? 'وضع رسم منطقة البحث' : 'Draw Search Area Mode'}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {isArabic
                        ? 'ارسم شكلاً على الخريطة لتحديد منطقة البحث'
                        : 'Draw a polygon on the map to define your search area'}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsMapSearchActive(false)}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            )}

            {/* Polygon Filter Active Badge */}
            {hasPolygonFilter && !isMapSearchActive && (
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="success">
                  <Map className="w-3 h-3 me-1" />
                  {isArabic ? 'فلتر الخريطة نشط' : 'Map Filter Active'}
                </Badge>
                <button
                  onClick={() => updateFilters({ ...currentFilters, polygon: undefined })}
                  className="text-sm text-error hover:underline"
                >
                  {isArabic ? 'مسح' : 'Clear'}
                </button>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Properties Grid/List/Map */}
            {viewMode === 'map' ? (
              <div className="h-[600px] lg:h-[700px]">
                <PropertiesMap
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  onPropertySelect={setSelectedPropertyId}
                  className="h-full"
                  viewMode={mapViewMode}
                  enableDrawing={isMapSearchActive}
                  onDrawCreate={handleDrawCreate}
                  showStyleControl
                  showGeolocation
                />
              </div>
            ) : isLoading ? (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold mb-2">
                  {isArabic ? 'لا توجد عقارات' : 'No properties found'}
                </h3>
                <p className="text-text-secondary mb-6">
                  {isArabic
                    ? 'جرب تعديل معايير البحث'
                    : 'Try adjusting your search criteria'}
                </p>
                <Button variant="outline" onClick={handleResetFilters}>
                  {isArabic ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={handlePropertyClick}
                    onFavorite={handleFavorite}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export { PropertiesPage };
