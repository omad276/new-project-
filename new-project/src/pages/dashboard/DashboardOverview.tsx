import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Building2,
  Heart,
  Eye,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Calendar,
  Plus,
  Search,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import type { Property } from '@/types';

// Mock data
const mockStats = [
  {
    label: 'myProperties',
    value: 5,
    change: 2,
    changeType: 'increase' as const,
    icon: Building2,
  },
  {
    label: 'favorites',
    value: 12,
    change: 3,
    changeType: 'increase' as const,
    icon: Heart,
  },
  {
    label: 'totalViews',
    value: 1248,
    change: 12,
    changeType: 'increase' as const,
    icon: Eye,
  },
  {
    label: 'inquiries',
    value: 28,
    change: -5,
    changeType: 'decrease' as const,
    icon: TrendingUp,
  },
];

const mockRecentProperties: Property[] = [
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Modern Apartment',
    titleAr: 'شقة حديثة',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockNotifications = [
  {
    id: '1',
    type: 'inquiry',
    title: 'New inquiry',
    titleAr: 'استفسار جديد',
    message: 'Someone is interested in your villa',
    messageAr: 'شخص مهتم بفيلتك',
    time: '5 min ago',
    timeAr: 'منذ 5 دقائق',
    read: false,
  },
  {
    id: '2',
    type: 'view',
    title: 'Property viewed',
    titleAr: 'تمت مشاهدة العقار',
    message: 'Your apartment was viewed 15 times today',
    messageAr: 'تمت مشاهدة شقتك 15 مرة اليوم',
    time: '1 hour ago',
    timeAr: 'منذ ساعة',
    read: false,
  },
  {
    id: '3',
    type: 'system',
    title: 'Profile updated',
    titleAr: 'تم تحديث الملف',
    message: 'Your profile has been updated successfully',
    messageAr: 'تم تحديث ملفك الشخصي بنجاح',
    time: '2 days ago',
    timeAr: 'منذ يومين',
    read: true,
  },
];

const mockUpcomingVisits = [
  {
    id: '1',
    property: 'Luxury Villa in Riyadh',
    propertyAr: 'فيلا فاخرة في الرياض',
    visitor: 'Ahmed Ali',
    visitorAr: 'أحمد علي',
    date: 'Tomorrow, 10:00 AM',
    dateAr: 'غداً، 10:00 صباحاً',
  },
  {
    id: '2',
    property: 'Modern Apartment',
    propertyAr: 'شقة حديثة',
    visitor: 'Sara Mohammed',
    visitorAr: 'سارة محمد',
    date: 'Sat, 2:00 PM',
    dateAr: 'السبت، 2:00 مساءً',
  },
];

function DashboardOverview() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isArabic = i18n.language === 'ar';

  const firstName = user?.fullName?.split(' ')[0] || '';

  const statLabels: Record<string, string> = {
    myProperties: t('dashboard.myProperties'),
    favorites: t('dashboard.favorites'),
    totalViews: isArabic ? 'المشاهدات' : 'Total Views',
    inquiries: isArabic ? 'الاستفسارات' : 'Inquiries',
  };

  const quickActions = [
    {
      icon: Plus,
      label: isArabic ? 'إضافة عقار' : 'Add Property',
      href: '/dashboard/properties/new',
      color: 'bg-primary',
    },
    {
      icon: Search,
      label: isArabic ? 'البحث عن عقار' : 'Search Properties',
      href: '/properties',
      color: 'bg-success',
    },
    {
      icon: BarChart3,
      label: isArabic ? 'عرض التقارير' : 'View Reports',
      href: '/dashboard/reports',
      color: 'bg-warning',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {isArabic ? `مرحباً، ${firstName}` : `Welcome back, ${firstName}`}
          </h1>
          <p className="text-text-secondary mt-1">
            {isArabic
              ? 'إليك ما يحدث مع عقاراتك اليوم'
              : "Here's what's happening with your properties today"}
          </p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Button variant="outline" size="sm" className="gap-2">
                <action.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div
                  className="p-3 rounded-xl bg-primary/10"
                >
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.changeType === 'increase' ? 'text-success' : 'text-error'
                  }`}
                >
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-text-secondary text-sm mt-1">
                  {statLabels[stat.label]}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Properties */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isArabic ? 'عقاراتي الأخيرة' : 'Recent Properties'}
            </h2>
            <Link to="/dashboard/properties">
              <Button variant="ghost" size="sm">
                {isArabic ? 'عرض الكل' : 'View All'}
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockRecentProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={(id) => console.log('View property', id)}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {t('dashboard.notifications')}
                </CardTitle>
                <Link to="/dashboard/notifications">
                  <Button variant="ghost" size="sm">
                    {isArabic ? 'الكل' : 'All'}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-background-tertiary">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-background-tertiary/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          notification.type === 'inquiry'
                            ? 'bg-success/10 text-success'
                            : notification.type === 'view'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-background-tertiary text-text-muted'
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {isArabic ? notification.titleAr : notification.title}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {isArabic ? notification.messageAr : notification.message}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {isArabic ? notification.timeAr : notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Visits */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {isArabic ? 'الزيارات القادمة' : 'Upcoming Visits'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-background-tertiary">
                {mockUpcomingVisits.map((visit) => (
                  <div key={visit.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-warning/10 text-warning">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {isArabic ? visit.propertyAr : visit.property}
                        </p>
                        <p className="text-xs text-text-muted">
                          {isArabic ? visit.visitorAr : visit.visitor}
                        </p>
                        <p className="text-xs text-primary mt-1">
                          {isArabic ? visit.dateAr : visit.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { DashboardOverview };
