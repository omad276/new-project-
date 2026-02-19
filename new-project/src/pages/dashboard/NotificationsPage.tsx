import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  MessageSquare,
  Eye,
  Heart,
  AlertCircle,
  Settings,
  TrendingDown,
  Home,
  Search,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { SavedSearchCard, SavedSearchModal, type SavedSearch } from '@/components/notifications';
import { cn, formatPrice } from '@/lib/utils';

type NotificationType = 'inquiry' | 'view' | 'favorite' | 'system' | 'alert' | 'price_drop' | 'new_listing';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  time: Date;
  read: boolean;
  link?: string;
  metadata?: {
    propertyId?: string;
    oldPrice?: number;
    newPrice?: number;
    searchId?: string;
  };
}

// Mock notifications with new types
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'price_drop',
    title: 'Price Drop Alert',
    titleAr: 'تنبيه انخفاض السعر',
    message: 'Luxury Villa in Riyadh dropped from 2,800,000 to 2,500,000 SAR (10% off)',
    messageAr: 'فيلا فاخرة في الرياض انخفض سعرها من 2,800,000 إلى 2,500,000 ريال (خصم 10%)',
    time: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    read: false,
    link: '/properties/1',
    metadata: {
      propertyId: '1',
      oldPrice: 2800000,
      newPrice: 2500000,
    },
  },
  {
    id: '2',
    type: 'new_listing',
    title: 'New Listing Match',
    titleAr: 'عقار جديد مطابق',
    message: 'A new property matches your "Riyadh Villas" search: Modern Villa in Al Nakheel',
    messageAr: 'عقار جديد يطابق بحثك "فلل الرياض": فيلا حديثة في النخيل',
    time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    link: '/properties/5',
    metadata: {
      searchId: '1',
    },
  },
  {
    id: '3',
    type: 'inquiry',
    title: 'New Inquiry',
    titleAr: 'استفسار جديد',
    message: 'Ahmed Ali is interested in your Luxury Villa in Riyadh',
    messageAr: 'أحمد علي مهتم بفيلتك الفاخرة في الرياض',
    time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    link: '/dashboard/properties/1',
  },
  {
    id: '4',
    type: 'price_drop',
    title: 'Price Drop Alert',
    titleAr: 'تنبيه انخفاض السعر',
    message: 'Modern Apartment in Jeddah dropped from 1,200,000 to 1,050,000 SAR (12.5% off)',
    messageAr: 'شقة حديثة في جدة انخفض سعرها من 1,200,000 إلى 1,050,000 ريال (خصم 12.5%)',
    time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: false,
    link: '/properties/2',
    metadata: {
      propertyId: '2',
      oldPrice: 1200000,
      newPrice: 1050000,
    },
  },
  {
    id: '5',
    type: 'view',
    title: 'Property Viewed',
    titleAr: 'تمت مشاهدة العقار',
    message: 'Your Modern Apartment was viewed 15 times today',
    messageAr: 'تمت مشاهدة شقتك الحديثة 15 مرة اليوم',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    link: '/dashboard/properties/2',
  },
  {
    id: '6',
    type: 'new_listing',
    title: 'New Listing Match',
    titleAr: 'عقار جديد مطابق',
    message: '3 new properties match your "Jeddah Apartments" search',
    messageAr: '3 عقارات جديدة تطابق بحثك "شقق جدة"',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: true,
    link: '/properties?search=2',
    metadata: {
      searchId: '2',
    },
  },
  {
    id: '7',
    type: 'favorite',
    title: 'Added to Favorites',
    titleAr: 'تمت الإضافة للمفضلة',
    message: 'Someone added your Office Space to their favorites',
    messageAr: 'قام شخص ما بإضافة مكتبك إلى المفضلة',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: true,
    link: '/dashboard/properties/3',
  },
  {
    id: '8',
    type: 'alert',
    title: 'Listing Expiring Soon',
    titleAr: 'قارب إعلانك على الانتهاء',
    message: 'Your property listing will expire in 3 days. Renew now to keep it active.',
    messageAr: 'سينتهي إعلان عقارك خلال 3 أيام. جدد الآن للحفاظ على نشاطه.',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: false,
    link: '/dashboard/properties/1',
  },
  {
    id: '9',
    type: 'system',
    title: 'Profile Updated',
    titleAr: 'تم تحديث الملف الشخصي',
    message: 'Your profile information has been updated successfully',
    messageAr: 'تم تحديث معلومات ملفك الشخصي بنجاح',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
  },
];

// Mock saved searches
const mockSavedSearches: SavedSearch[] = [
  {
    id: '1',
    name: 'Riyadh Villas',
    nameAr: 'فلل الرياض',
    criteria: {
      location: 'Riyadh',
      locationAr: 'الرياض',
      propertyType: 'villa',
      minPrice: 1500000,
      maxPrice: 3000000,
      bedrooms: 4,
    },
    alertsEnabled: true,
    matchCount: 23,
    lastChecked: new Date(Date.now() - 60 * 60 * 1000),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Jeddah Apartments',
    nameAr: 'شقق جدة',
    criteria: {
      location: 'Jeddah',
      locationAr: 'جدة',
      propertyType: 'apartment',
      maxPrice: 1500000,
      bedrooms: 2,
    },
    alertsEnabled: true,
    matchCount: 45,
    lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    name: 'Investment Properties',
    nameAr: 'عقارات استثمارية',
    criteria: {
      propertyType: 'office',
      minArea: 200,
    },
    alertsEnabled: false,
    matchCount: 12,
    lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-01-20'),
  },
];

function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [notifications, setNotifications] = useState(mockNotifications);
  const [savedSearches, setSavedSearches] = useState(mockSavedSearches);
  const [activeTab, setActiveTab] = useState('all');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);

  const typeIcons: Record<NotificationType, typeof Bell> = {
    inquiry: MessageSquare,
    view: Eye,
    favorite: Heart,
    system: Settings,
    alert: AlertCircle,
    price_drop: TrendingDown,
    new_listing: Home,
  };

  const typeColors: Record<NotificationType, string> = {
    inquiry: 'bg-success/10 text-success',
    view: 'bg-primary/10 text-primary',
    favorite: 'bg-error/10 text-error',
    system: 'bg-background-tertiary text-text-muted',
    alert: 'bg-warning/10 text-warning',
    price_drop: 'bg-green-500/10 text-green-500',
    new_listing: 'bg-blue-500/10 text-blue-500',
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const priceDropCount = notifications.filter((n) => n.type === 'price_drop' && !n.read).length;
  const newListingCount = notifications.filter((n) => n.type === 'new_listing' && !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'price_drops') return notification.type === 'price_drop';
    if (activeTab === 'new_listings') return notification.type === 'new_listing';
    return notification.type === activeTab;
  });

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return isArabic ? 'الآن' : 'Just now';
    if (diffMins < 60) return isArabic ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    if (diffDays < 7) return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US');
  };

  // Saved search handlers
  const handleToggleSearchAlerts = (id: string) => {
    setSavedSearches(
      savedSearches.map((s) =>
        s.id === id ? { ...s, alertsEnabled: !s.alertsEnabled } : s
      )
    );
  };

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(savedSearches.filter((s) => s.id !== id));
  };

  const handleEditSearch = (search: SavedSearch) => {
    setEditingSearch(search);
    setShowSearchModal(true);
  };

  const handleViewResults = (search: SavedSearch) => {
    // Navigate to properties page with search criteria
    console.log('View results for:', search);
  };

  const handleSaveSearch = (searchData: Omit<SavedSearch, 'id' | 'matchCount' | 'lastChecked' | 'createdAt'>) => {
    if (editingSearch) {
      // Update existing search
      setSavedSearches(
        savedSearches.map((s) =>
          s.id === editingSearch.id
            ? { ...s, ...searchData }
            : s
        )
      );
    } else {
      // Create new search
      const newSearch: SavedSearch = {
        ...searchData,
        id: Date.now().toString(),
        matchCount: Math.floor(Math.random() * 50) + 5,
        lastChecked: new Date(),
        createdAt: new Date(),
      };
      setSavedSearches([newSearch, ...savedSearches]);
    }
    setEditingSearch(null);
  };

  const renderPriceDropBadge = (notification: Notification) => {
    if (notification.type !== 'price_drop' || !notification.metadata) return null;
    const { oldPrice, newPrice } = notification.metadata;
    if (!oldPrice || !newPrice) return null;

    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    return (
      <Badge variant="success" size="sm" className="ms-2">
        -{discount}%
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.notifications')}</h1>
          <p className="text-text-secondary mt-1">
            {unreadCount > 0
              ? isArabic
                ? `لديك ${unreadCount} إشعارات غير مقروءة`
                : `You have ${unreadCount} unread notifications`
              : isArabic
              ? 'لا توجد إشعارات جديدة'
              : 'No new notifications'}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4" />
                {isArabic ? 'قراءة الكل' : 'Mark all read'}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 className="w-4 h-4" />
              {isArabic ? 'مسح الكل' : 'Clear all'}
            </Button>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 me-2" />
            {isArabic ? 'الإشعارات' : 'Notifications'}
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm" className="ms-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="saved-searches">
            <Search className="w-4 h-4 me-2" />
            {isArabic ? 'عمليات البحث المحفوظة' : 'Saved Searches'}
            <Badge variant="default" size="sm" className="ms-2">
              {savedSearches.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          {/* Notification Type Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={activeTab === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('all')}
            >
              {isArabic ? 'الكل' : 'All'}
            </Button>
            <Button
              variant={activeTab === 'unread' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('unread')}
            >
              {isArabic ? 'غير مقروء' : 'Unread'}
              {unreadCount > 0 && (
                <Badge variant={activeTab === 'unread' ? 'default' : 'primary'} size="sm" className="ms-2">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'price_drops' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('price_drops')}
            >
              <TrendingDown className="w-4 h-4 me-1" />
              {isArabic ? 'انخفاض الأسعار' : 'Price Drops'}
              {priceDropCount > 0 && (
                <Badge variant="success" size="sm" className="ms-2">
                  {priceDropCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'new_listings' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('new_listings')}
            >
              <Home className="w-4 h-4 me-1" />
              {isArabic ? 'عقارات جديدة' : 'New Listings'}
              {newListingCount > 0 && (
                <Badge variant="primary" size="sm" className="ms-2">
                  {newListingCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'inquiry' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('inquiry')}
            >
              {isArabic ? 'استفسارات' : 'Inquiries'}
            </Button>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background-tertiary mb-4">
                  <Bell className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isArabic ? 'لا توجد إشعارات' : 'No notifications'}
                </h3>
                <p className="text-text-secondary">
                  {activeTab === 'unread'
                    ? isArabic
                      ? 'لقد قرأت جميع الإشعارات'
                      : "You've read all notifications"
                    : activeTab === 'price_drops'
                    ? isArabic
                      ? 'لا توجد تنبيهات انخفاض أسعار'
                      : 'No price drop alerts yet'
                    : activeTab === 'new_listings'
                    ? isArabic
                      ? 'لا توجد عقارات جديدة مطابقة'
                      : 'No new listing matches yet'
                    : isArabic
                    ? 'ستظهر الإشعارات الجديدة هنا'
                    : 'New notifications will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      'transition-colors',
                      !notification.read && 'bg-primary/5 border-primary/20'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            'p-2 rounded-lg flex-shrink-0',
                            typeColors[notification.type]
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-medium flex items-center">
                                {isArabic ? notification.titleAr : notification.title}
                                {renderPriceDropBadge(notification)}
                              </h3>
                              <p className="text-sm text-text-secondary mt-1">
                                {isArabic ? notification.messageAr : notification.message}
                              </p>
                              <p className="text-xs text-text-muted mt-2">
                                {formatTime(notification.time)}
                              </p>
                            </div>

                            {/* Unread indicator */}
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-3">
                            {notification.link && (
                              <a href={notification.link}>
                                <Button variant="outline" size="sm">
                                  {notification.type === 'price_drop'
                                    ? isArabic
                                      ? 'عرض العقار'
                                      : 'View Property'
                                    : notification.type === 'new_listing'
                                    ? isArabic
                                      ? 'عرض العقارات'
                                      : 'View Listings'
                                    : isArabic
                                    ? 'عرض'
                                    : 'View'}
                                </Button>
                              </a>
                            )}
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="w-4 h-4" />
                                {isArabic ? 'قراءة' : 'Mark read'}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-text-muted hover:text-error"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Saved Searches Tab */}
        <TabsContent value="saved-searches">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-text-secondary">
                {isArabic
                  ? 'احصل على تنبيهات عندما تتوفر عقارات جديدة تطابق معايير بحثك'
                  : 'Get alerts when new properties match your search criteria'}
              </p>
              <Button onClick={() => {
                setEditingSearch(null);
                setShowSearchModal(true);
              }}>
                <Plus className="w-4 h-4" />
                {isArabic ? 'بحث جديد' : 'New Search'}
              </Button>
            </div>

            {/* Saved Searches List */}
            {savedSearches.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background-tertiary mb-4">
                    <Search className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {isArabic ? 'لا توجد عمليات بحث محفوظة' : 'No saved searches'}
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {isArabic
                      ? 'احفظ معايير البحث للحصول على تنبيهات عند توفر عقارات جديدة'
                      : 'Save your search criteria to get notified about new listings'}
                  </p>
                  <Button onClick={() => setShowSearchModal(true)}>
                    <Plus className="w-4 h-4" />
                    {isArabic ? 'إنشاء بحث محفوظ' : 'Create Saved Search'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <SavedSearchCard
                    key={search.id}
                    search={search}
                    isArabic={isArabic}
                    onToggleAlerts={handleToggleSearchAlerts}
                    onDelete={handleDeleteSearch}
                    onEdit={handleEditSearch}
                    onViewResults={handleViewResults}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Saved Search Modal */}
      <SavedSearchModal
        isOpen={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          setEditingSearch(null);
        }}
        onSave={handleSaveSearch}
        editSearch={editingSearch}
        isArabic={isArabic}
      />
    </div>
  );
}

export { NotificationsPage };
