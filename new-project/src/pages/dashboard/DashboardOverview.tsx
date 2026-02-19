import { useState } from 'react';
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
  MessageSquare,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  ViewsChart,
  PortfolioValueChart,
  PropertyTypeChart,
  PerformanceMetrics,
  TopPropertiesTable,
} from '@/components/analytics';
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

// Analytics mock data
const mockViewsData = [
  { date: 'Jan', views: 120, inquiries: 8 },
  { date: 'Feb', views: 180, inquiries: 12 },
  { date: 'Mar', views: 250, inquiries: 18 },
  { date: 'Apr', views: 310, inquiries: 22 },
  { date: 'May', views: 280, inquiries: 15 },
  { date: 'Jun', views: 420, inquiries: 28 },
  { date: 'Jul', views: 380, inquiries: 25 },
  { date: 'Aug', views: 520, inquiries: 35 },
  { date: 'Sep', views: 480, inquiries: 30 },
  { date: 'Oct', views: 620, inquiries: 42 },
  { date: 'Nov', views: 580, inquiries: 38 },
  { date: 'Dec', views: 750, inquiries: 48 },
];

const mockPortfolioData = [
  { month: 'Jan', value: 8500000 },
  { month: 'Feb', value: 8650000 },
  { month: 'Mar', value: 8800000 },
  { month: 'Apr', value: 8750000 },
  { month: 'May', value: 9100000 },
  { month: 'Jun', value: 9350000 },
  { month: 'Jul', value: 9500000 },
  { month: 'Aug', value: 9800000 },
  { month: 'Sep', value: 10200000 },
  { month: 'Oct', value: 10500000 },
  { month: 'Nov', value: 10800000 },
  { month: 'Dec', value: 11200000 },
];

const mockPropertyTypeData = [
  { name: 'Villas', value: 3, color: '#C5A572' },
  { name: 'Apartments', value: 5, color: '#22C55E' },
  { name: 'Offices', value: 2, color: '#3B82F6' },
  { name: 'Land', value: 2, color: '#F59E0B' },
];

const mockTopProperties = [
  {
    id: '1',
    title: 'Luxury Villa in Riyadh',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200',
    price: 2500000,
    views: 856,
    favorites: 45,
    inquiries: 12,
    trend: 'up' as const,
  },
  {
    id: '2',
    title: 'Modern Apartment in Jeddah',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200',
    price: 1200000,
    views: 642,
    favorites: 32,
    inquiries: 8,
    trend: 'up' as const,
  },
  {
    id: '3',
    title: 'Office Space Downtown',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200',
    price: 3500000,
    views: 423,
    favorites: 18,
    inquiries: 5,
    trend: 'stable' as const,
  },
  {
    id: '4',
    title: 'Commercial Land Plot',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200',
    price: 5000000,
    views: 312,
    favorites: 12,
    inquiries: 3,
    trend: 'down' as const,
  },
];

function DashboardOverview() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isArabic = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('overview');

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
      href: '/dashboard/financial-tools',
      color: 'bg-warning',
    },
  ];

  const performanceMetrics = [
    {
      label: isArabic ? 'إجمالي المشاهدات' : 'Total Views',
      value: '4,892',
      change: 12,
      icon: Eye,
    },
    {
      label: isArabic ? 'المفضلات' : 'Favorites',
      value: '127',
      change: 8,
      icon: Heart,
    },
    {
      label: isArabic ? 'الاستفسارات' : 'Inquiries',
      value: '48',
      change: -3,
      icon: MessageSquare,
    },
    {
      label: isArabic ? 'معدل التحويل' : 'Conversion Rate',
      value: '3.2%',
      change: 5,
      icon: TrendingUp,
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
                <div className="p-3 rounded-xl bg-primary/10">
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
                <p className="text-text-secondary text-sm mt-1">{statLabels[stat.label]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" onClick={() => setActiveTab('overview')}>
            {isArabic ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="analytics" onClick={() => setActiveTab('analytics')}>
            <BarChart3 className="w-4 h-4 me-2" />
            {isArabic ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
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
                    <CardTitle className="text-base">{t('dashboard.notifications')}</CardTitle>
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
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Portfolio & Views Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PortfolioValueChart
                data={mockPortfolioData}
                title={isArabic ? 'قيمة المحفظة' : 'Portfolio Value'}
                totalValue={11200000}
                changePercent={31.8}
              />
              <ViewsChart
                data={mockViewsData}
                title={isArabic ? 'المشاهدات والاستفسارات' : 'Views & Inquiries'}
              />
            </div>

            {/* Metrics & Property Types Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PerformanceMetrics
                metrics={performanceMetrics}
                title={isArabic ? 'مؤشرات الأداء' : 'Performance Metrics'}
                className="lg:col-span-2"
              />
              <PropertyTypeChart
                data={mockPropertyTypeData}
                title={isArabic ? 'توزيع العقارات' : 'Property Distribution'}
              />
            </div>

            {/* Top Properties Table */}
            <TopPropertiesTable
              properties={mockTopProperties}
              title={isArabic ? 'أفضل العقارات أداءً' : 'Top Performing Properties'}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { DashboardOverview };
