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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

type NotificationType = 'inquiry' | 'view' | 'favorite' | 'system' | 'alert';

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
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'inquiry',
    title: 'New Inquiry',
    titleAr: 'استفسار جديد',
    message: 'Ahmed Ali is interested in your Luxury Villa in Riyadh',
    messageAr: 'أحمد علي مهتم بفيلتك الفاخرة في الرياض',
    time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    link: '/dashboard/properties/1',
  },
  {
    id: '2',
    type: 'view',
    title: 'Property Viewed',
    titleAr: 'تمت مشاهدة العقار',
    message: 'Your Modern Apartment was viewed 15 times today',
    messageAr: 'تمت مشاهدة شقتك الحديثة 15 مرة اليوم',
    time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: false,
    link: '/dashboard/properties/2',
  },
  {
    id: '3',
    type: 'favorite',
    title: 'Added to Favorites',
    titleAr: 'تمت الإضافة للمفضلة',
    message: 'Someone added your Office Space to their favorites',
    messageAr: 'قام شخص ما بإضافة مكتبك إلى المفضلة',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: true,
    link: '/dashboard/properties/3',
  },
  {
    id: '4',
    type: 'system',
    title: 'Profile Updated',
    titleAr: 'تم تحديث الملف الشخصي',
    message: 'Your profile information has been updated successfully',
    messageAr: 'تم تحديث معلومات ملفك الشخصي بنجاح',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
  {
    id: '5',
    type: 'alert',
    title: 'Listing Expiring Soon',
    titleAr: 'قارب إعلانك على الانتهاء',
    message: 'Your property listing will expire in 3 days. Renew now to keep it active.',
    messageAr: 'سينتهي إعلان عقارك خلال 3 أيام. جدد الآن للحفاظ على نشاطه.',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: false,
    link: '/dashboard/properties/1',
  },
  {
    id: '6',
    type: 'inquiry',
    title: 'New Message',
    titleAr: 'رسالة جديدة',
    message: 'You received a new message from Sara Mohammed',
    messageAr: 'استلمت رسالة جديدة من سارة محمد',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
  },
];

function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const typeIcons: Record<NotificationType, typeof Bell> = {
    inquiry: MessageSquare,
    view: Eye,
    favorite: Heart,
    system: Settings,
    alert: AlertCircle,
  };

  const typeColors: Record<NotificationType, string> = {
    inquiry: 'bg-success/10 text-success',
    view: 'bg-primary/10 text-primary',
    favorite: 'bg-error/10 text-error',
    system: 'bg-background-tertiary text-text-muted',
    alert: 'bg-warning/10 text-warning',
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
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

      {/* Filters */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setActiveTab('all')}>
            {isArabic ? 'الكل' : 'All'}
            {notifications.length > 0 && (
              <Badge variant="default" size="sm" className="ms-2">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" onClick={() => setActiveTab('unread')}>
            {isArabic ? 'غير مقروء' : 'Unread'}
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm" className="ms-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inquiry" onClick={() => setActiveTab('inquiry')}>
            {isArabic ? 'استفسارات' : 'Inquiries'}
          </TabsTrigger>
          <TabsTrigger value="system" onClick={() => setActiveTab('system')}>
            {isArabic ? 'النظام' : 'System'}
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
                          <h3 className="font-medium">
                            {isArabic ? notification.titleAr : notification.title}
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
                              {isArabic ? 'عرض' : 'View'}
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
    </div>
  );
}

export { NotificationsPage };
