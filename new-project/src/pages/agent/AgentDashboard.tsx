import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Users,
  Eye,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Star,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for agent dashboard
const mockStats = {
  activeListings: 12,
  activeListingsChange: 2,
  totalLeads: 28,
  leadsChange: 5,
  monthlyViews: 1842,
  viewsChange: 18,
  closedDeals: 3,
  dealsChange: 1,
};

const mockRecentLeads = [
  {
    id: '1',
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الراشد',
    email: 'ahmed@email.com',
    phone: '+966 50 123 4567',
    property: 'Luxury Villa in Riyadh',
    propertyAr: 'فيلا فاخرة في الرياض',
    status: 'new',
    createdAt: '2 hours ago',
    createdAtAr: 'منذ ساعتين',
  },
  {
    id: '2',
    name: 'Sara Mohammed',
    nameAr: 'سارة محمد',
    email: 'sara@email.com',
    phone: '+966 55 987 6543',
    property: 'Modern Apartment in Jeddah',
    propertyAr: 'شقة حديثة في جدة',
    status: 'contacted',
    createdAt: '5 hours ago',
    createdAtAr: 'منذ 5 ساعات',
  },
  {
    id: '3',
    name: 'Mohammed Ali',
    nameAr: 'محمد علي',
    email: 'mohammed@email.com',
    phone: '+966 54 456 7890',
    property: 'Office Space Downtown',
    propertyAr: 'مكتب في وسط المدينة',
    status: 'viewing_scheduled',
    createdAt: '1 day ago',
    createdAtAr: 'منذ يوم',
  },
];

const mockUpcomingAppointments = [
  {
    id: '1',
    client: 'Ahmed Al-Rashid',
    clientAr: 'أحمد الراشد',
    property: 'Luxury Villa',
    propertyAr: 'فيلا فاخرة',
    type: 'viewing',
    date: 'Today, 3:00 PM',
    dateAr: 'اليوم، 3:00 مساءً',
  },
  {
    id: '2',
    client: 'Sara Mohammed',
    clientAr: 'سارة محمد',
    property: 'Modern Apartment',
    propertyAr: 'شقة حديثة',
    type: 'meeting',
    date: 'Tomorrow, 11:00 AM',
    dateAr: 'غداً، 11:00 صباحاً',
  },
  {
    id: '3',
    client: 'Khalid Hassan',
    clientAr: 'خالد حسن',
    property: 'Commercial Land',
    propertyAr: 'أرض تجارية',
    type: 'signing',
    date: 'Sat, 2:00 PM',
    dateAr: 'السبت، 2:00 مساءً',
  },
];

const mockTopListings = [
  {
    id: '1',
    title: 'Luxury Villa in Al Olaya',
    titleAr: 'فيلا فاخرة في العليا',
    price: 2500000,
    views: 342,
    inquiries: 8,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200',
  },
  {
    id: '2',
    title: 'Modern Apartment',
    titleAr: 'شقة حديثة',
    price: 850000,
    views: 256,
    inquiries: 5,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200',
  },
  {
    id: '3',
    title: 'Office Space',
    titleAr: 'مساحة مكتبية',
    price: 1200000,
    views: 189,
    inquiries: 3,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200',
  },
];

function AgentDashboard() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isArabic = i18n.language === 'ar';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const firstName = user?.fullName?.split(' ')[0] || '';

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return isArabic ? 'صباح الخير' : 'Good morning';
    if (hour < 18) return isArabic ? 'مساء الخير' : 'Good afternoon';
    return isArabic ? 'مساء الخير' : 'Good evening';
  };

  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return { variant: 'primary' as const, label: isArabic ? 'جديد' : 'New' };
      case 'contacted':
        return { variant: 'warning' as const, label: isArabic ? 'تم التواصل' : 'Contacted' };
      case 'viewing_scheduled':
        return { variant: 'success' as const, label: isArabic ? 'معاينة مجدولة' : 'Viewing Scheduled' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-text-secondary mt-2">
            {isArabic
              ? 'إليك ملخص نشاطك اليوم'
              : "Here's a summary of your activity today"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/agent/listings">
            <Button variant="outline">
              <Building2 className="w-4 h-4 me-2" />
              {isArabic ? 'قوائمي' : 'My Listings'}
            </Button>
          </Link>
          <Link to="/dashboard/properties/new">
            <Button variant="primary">
              {isArabic ? 'إضافة عقار' : 'Add Property'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                +{mockStats.activeListingsChange}
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-3">
              {mockStats.activeListings}
            </p>
            <p className="text-text-secondary text-sm">
              {isArabic ? 'قوائم نشطة' : 'Active Listings'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                +{mockStats.leadsChange}
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-3">
              {mockStats.totalLeads}
            </p>
            <p className="text-text-secondary text-sm">
              {isArabic ? 'عملاء محتملين' : 'Total Leads'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Eye className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                +{mockStats.viewsChange}%
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-3">
              {mockStats.monthlyViews.toLocaleString()}
            </p>
            <p className="text-text-secondary text-sm">
              {isArabic ? 'مشاهدات الشهر' : 'Monthly Views'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <DollarSign className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                +{mockStats.dealsChange}
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-3">
              {mockStats.closedDeals}
            </p>
            <p className="text-text-secondary text-sm">
              {isArabic ? 'صفقات هذا الشهر' : 'Deals This Month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {isArabic ? 'العملاء المحتملين الجدد' : 'Recent Leads'}
                </CardTitle>
                <Link to="/agent/leads">
                  <Button variant="ghost" size="sm">
                    {isArabic ? 'عرض الكل' : 'View All'}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentLeads.map((lead) => {
                  const status = getLeadStatusBadge(lead.status);
                  return (
                    <div
                      key={lead.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-background-tertiary/50 hover:bg-background-tertiary transition-colors"
                    >
                      <Avatar name={isArabic ? lead.nameAr : lead.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-text-primary">
                            {isArabic ? lead.nameAr : lead.name}
                          </p>
                          <Badge variant={status.variant} size="sm">
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">
                          {isArabic ? lead.propertyAr : lead.property}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isArabic ? lead.createdAtAr : lead.createdAt}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {isArabic ? 'المواعيد القادمة' : 'Upcoming Appointments'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUpcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 rounded-lg border border-background-tertiary"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-text-primary">
                        {isArabic ? appointment.clientAr : appointment.client}
                      </p>
                      <Badge
                        variant={
                          appointment.type === 'viewing'
                            ? 'primary'
                            : appointment.type === 'meeting'
                            ? 'warning'
                            : 'success'
                        }
                        size="sm"
                      >
                        {appointment.type === 'viewing'
                          ? isArabic
                            ? 'معاينة'
                            : 'Viewing'
                          : appointment.type === 'meeting'
                          ? isArabic
                            ? 'اجتماع'
                            : 'Meeting'
                          : isArabic
                          ? 'توقيع'
                          : 'Signing'}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">
                      {isArabic ? appointment.propertyAr : appointment.property}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {isArabic ? appointment.dateAr : appointment.date}
                    </p>
                  </div>
                ))}
              </div>
              <Link to="/agent/appointments" className="block mt-4">
                <Button variant="outline" className="w-full">
                  {isArabic ? 'عرض جميع المواعيد' : 'View All Appointments'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Listings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              {isArabic ? 'أفضل القوائم أداءً' : 'Top Performing Listings'}
            </CardTitle>
            <Link to="/agent/listings">
              <Button variant="ghost" size="sm">
                {isArabic ? 'عرض الكل' : 'View All'}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockTopListings.map((listing) => (
              <div
                key={listing.id}
                className="flex gap-4 p-4 rounded-lg bg-background-tertiary/50 hover:bg-background-tertiary transition-colors"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary line-clamp-1">
                    {isArabic ? listing.titleAr : listing.title}
                  </p>
                  <p className="text-primary font-bold mt-1">
                    {formatPrice(listing.price)}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {listing.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {listing.inquiries}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/dashboard/properties/new">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-text-primary">
                {isArabic ? 'إضافة عقار' : 'Add Property'}
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/agent/leads">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className="font-medium text-text-primary">
                {isArabic ? 'إدارة العملاء' : 'Manage Leads'}
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/agent/messages">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <MessageSquare className="w-5 h-5 text-green-500" />
              </div>
              <span className="font-medium text-text-primary">
                {isArabic ? 'الرسائل' : 'Messages'}
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/agent/performance">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="font-medium text-text-primary">
                {isArabic ? 'تقارير الأداء' : 'Performance'}
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export { AgentDashboard };
