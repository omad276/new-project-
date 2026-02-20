import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreVertical,
  Star,
  StarOff,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getPropertyStats, PropertyStats } from '@/services/adminService';
import { api } from '@/services/api';

interface Property {
  id: string;
  title: string;
  titleAr?: string;
  price: number;
  type: string;
  category: string;
  status: 'for_sale' | 'for_rent' | 'sold' | 'rented';
  isFeatured: boolean;
  images: string[];
  location: {
    city: string;
    district?: string;
  };
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

interface PropertiesResponse {
  success: boolean;
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function PropertiesPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [featuredFilter, setFeaturedFilter] = useState(searchParams.get('featured') || '');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Modal state
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      if (searchQuery) params.set('q', searchQuery);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (featuredFilter === 'true') params.set('isFeatured', 'true');
      if (featuredFilter === 'false') params.set('isFeatured', 'false');

      const response = await api.get<PropertiesResponse>(`/properties?${params.toString()}`);
      setProperties(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(isArabic ? 'فشل في تحميل العقارات' : 'Failed to load properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, typeFilter, statusFilter, featuredFilter, isArabic]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getPropertyStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (featuredFilter) params.set('featured', featuredFilter);
    setSearchParams(params);
    fetchProperties();
  };

  const handleToggleFeatured = async (property: Property) => {
    try {
      await api.patch(`/properties/${property.id}`, {
        isFeatured: !property.isFeatured,
      });
      fetchProperties();
      fetchStats();
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
    setOpenDropdown(null);
  };

  const handleDelete = async (property: Property) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا العقار؟' : 'Are you sure you want to delete this property?')) {
      return;
    }
    try {
      await api.delete(`/properties/${property.id}`);
      fetchProperties();
      fetchStats();
    } catch (err) {
      console.error('Error deleting property:', err);
    }
    setOpenDropdown(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'for_sale':
        return 'primary';
      case 'for_rent':
        return 'success';
      case 'sold':
        return 'error';
      case 'rented':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const types = [
    { value: '', label: isArabic ? 'جميع الأنواع' : 'All Types' },
    { value: 'apartment', label: isArabic ? 'شقة' : 'Apartment' },
    { value: 'villa', label: isArabic ? 'فيلا' : 'Villa' },
    { value: 'office', label: isArabic ? 'مكتب' : 'Office' },
    { value: 'land', label: isArabic ? 'أرض' : 'Land' },
    { value: 'warehouse', label: isArabic ? 'مستودع' : 'Warehouse' },
  ];

  const statuses = [
    { value: '', label: isArabic ? 'جميع الحالات' : 'All Statuses' },
    { value: 'for_sale', label: isArabic ? 'للبيع' : 'For Sale' },
    { value: 'for_rent', label: isArabic ? 'للإيجار' : 'For Rent' },
    { value: 'sold', label: isArabic ? 'مباع' : 'Sold' },
    { value: 'rented', label: isArabic ? 'مؤجر' : 'Rented' },
  ];

  const featuredOptions = [
    { value: '', label: isArabic ? 'الكل' : 'All' },
    { value: 'true', label: isArabic ? 'مميزة' : 'Featured' },
    { value: 'false', label: isArabic ? 'غير مميزة' : 'Not Featured' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          {isArabic ? 'إدارة العقارات' : 'Property Management'}
        </h1>
        <p className="text-text-secondary mt-2">
          {isArabic
            ? 'مراجعة وإدارة قوائم العقارات'
            : 'Review and manage property listings'}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-text-secondary text-sm">
                {isArabic ? 'إجمالي العقارات' : 'Total Properties'}
              </p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalProperties}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-secondary text-sm">
                {isArabic ? 'للبيع' : 'For Sale'}
              </p>
              <p className="text-2xl font-bold text-primary">{stats.forSale}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-secondary text-sm">
                {isArabic ? 'للإيجار' : 'For Rent'}
              </p>
              <p className="text-2xl font-bold text-green-500">{stats.forRent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-secondary text-sm">
                {isArabic ? 'مميزة' : 'Featured'}
              </p>
              <p className="text-2xl font-bold text-yellow-500">{stats.featured}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                type="text"
                placeholder={isArabic ? 'البحث عن عقار...' : 'Search properties...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <select
                value={featuredFilter}
                onChange={(e) => {
                  setFeaturedFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {featuredOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="primary">
                <Filter className="w-4 h-4 me-2" />
                {isArabic ? 'تصفية' : 'Filter'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'العقارات' : 'Properties'} ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-error mb-4">{error}</p>
              <Button onClick={fetchProperties}>
                {isArabic ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">
                {isArabic ? 'لا يوجد عقارات' : 'No properties found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-background-tertiary">
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'العقار' : 'Property'}
                    </th>
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'المالك' : 'Owner'}
                    </th>
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'النوع' : 'Type'}
                    </th>
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'الحالة' : 'Status'}
                    </th>
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'السعر' : 'Price'}
                    </th>
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'مميز' : 'Featured'}
                    </th>
                    <th className="text-end p-4 text-text-secondary font-medium">
                      {isArabic ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr
                      key={property.id}
                      className="border-b border-background-tertiary hover:bg-background-tertiary/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded-lg bg-background-tertiary overflow-hidden flex-shrink-0">
                            {property.images[0] ? (
                              <img
                                src={property.images[0]}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-muted">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary line-clamp-1">
                              {isArabic && property.titleAr ? property.titleAr : property.title}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {property.location.city}
                              {property.location.district && `, ${property.location.district}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-text-primary">{property.owner.fullName}</p>
                        <p className="text-sm text-text-secondary">{property.owner.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-text-primary capitalize">
                          {property.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusBadgeVariant(property.status)} size="sm">
                          {property.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 text-text-primary">
                        {formatPrice(property.price)}
                      </td>
                      <td className="p-4">
                        {property.isFeatured ? (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="w-5 h-5 text-text-muted" />
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 relative">
                          <button
                            onClick={() =>
                              setOpenDropdown(openDropdown === property.id ? null : property.id)
                            }
                            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-text-secondary" />
                          </button>
                          {openDropdown === property.id && (
                            <div className="absolute end-0 top-full mt-1 w-48 bg-background-secondary border border-background-tertiary rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => {
                                  setViewingProperty(property);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-start text-text-primary hover:bg-background-tertiary"
                              >
                                <Eye className="w-4 h-4" />
                                {isArabic ? 'عرض التفاصيل' : 'View Details'}
                              </button>
                              <button
                                onClick={() => handleToggleFeatured(property)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-start text-text-primary hover:bg-background-tertiary"
                              >
                                {property.isFeatured ? (
                                  <>
                                    <StarOff className="w-4 h-4" />
                                    {isArabic ? 'إلغاء التمييز' : 'Remove Featured'}
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4" />
                                    {isArabic ? 'تمييز' : 'Make Featured'}
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(property)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-start text-error hover:bg-background-tertiary"
                              >
                                <Trash2 className="w-4 h-4" />
                                {isArabic ? 'حذف' : 'Delete'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-background-tertiary">
              <p className="text-text-secondary">
                {isArabic
                  ? `عرض ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )} من ${pagination.total}`
                  : `Showing ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )} of ${pagination.total}`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </Button>
                <span className="text-text-primary">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Details Modal */}
      {viewingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setViewingProperty(null)}
          />
          <div className="relative bg-background-secondary rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background-secondary p-4 border-b border-background-tertiary flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">
                {isArabic ? 'تفاصيل العقار' : 'Property Details'}
              </h2>
              <button
                onClick={() => setViewingProperty(null)}
                className="p-2 rounded-lg hover:bg-background-tertiary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Images */}
              {viewingProperty.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {viewingProperty.images.slice(0, 6).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video rounded-lg bg-background-tertiary overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {isArabic && viewingProperty.titleAr
                      ? viewingProperty.titleAr
                      : viewingProperty.title}
                  </h3>
                  <p className="text-text-secondary">
                    {viewingProperty.location.city}
                    {viewingProperty.location.district && `, ${viewingProperty.location.district}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-secondary text-sm">
                      {isArabic ? 'السعر' : 'Price'}
                    </p>
                    <p className="text-text-primary font-medium">
                      {formatPrice(viewingProperty.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">
                      {isArabic ? 'النوع' : 'Type'}
                    </p>
                    <p className="text-text-primary font-medium capitalize">
                      {viewingProperty.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">
                      {isArabic ? 'الحالة' : 'Status'}
                    </p>
                    <Badge variant={getStatusBadgeVariant(viewingProperty.status)}>
                      {viewingProperty.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">
                      {isArabic ? 'مميز' : 'Featured'}
                    </p>
                    <p className="text-text-primary font-medium">
                      {viewingProperty.isFeatured
                        ? isArabic
                          ? 'نعم'
                          : 'Yes'
                        : isArabic
                        ? 'لا'
                        : 'No'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-background-tertiary">
                  <p className="text-text-secondary text-sm mb-2">
                    {isArabic ? 'المالك' : 'Owner'}
                  </p>
                  <p className="text-text-primary font-medium">
                    {viewingProperty.owner.fullName}
                  </p>
                  <p className="text-text-secondary">{viewingProperty.owner.email}</p>
                </div>

                <div className="pt-4 border-t border-background-tertiary">
                  <p className="text-text-secondary text-sm">
                    {isArabic ? 'تاريخ الإنشاء' : 'Created'}
                  </p>
                  <p className="text-text-primary">
                    {new Date(viewingProperty.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { PropertiesPage };
