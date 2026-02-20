import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Building2,
  TrendingUp,
  Star,
  ArrowRight,
  UserPlus,
  Home,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getUserStats, getPropertyStats, UserStats, PropertyStats } from '@/services/adminService';

function AdminDashboard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const [userResponse, propertyResponse] = await Promise.all([
          getUserStats(),
          getPropertyStats(),
        ]);
        setUserStats(userResponse.data);
        setPropertyStats(propertyResponse.data);
      } catch (err) {
        setError(isArabic ? 'فشل في تحميل الإحصائيات' : 'Failed to load statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [isArabic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          {isArabic ? 'إعادة المحاولة' : 'Retry'}
        </Button>
      </div>
    );
  }

  const statsCards = [
    {
      title: isArabic ? 'إجمالي المستخدمين' : 'Total Users',
      value: userStats?.total || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      link: '/admin/users',
    },
    {
      title: isArabic ? 'إجمالي العقارات' : 'Total Properties',
      value: propertyStats?.totalProperties || 0,
      icon: Building2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      link: '/admin/properties',
    },
    {
      title: isArabic ? 'للبيع' : 'For Sale',
      value: propertyStats?.forSale || 0,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      link: '/admin/properties?status=for_sale',
    },
    {
      title: isArabic ? 'المميزة' : 'Featured',
      value: propertyStats?.featured || 0,
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      link: '/admin/properties?featured=true',
    },
  ];

  const quickActions = [
    {
      title: isArabic ? 'إدارة المستخدمين' : 'Manage Users',
      description: isArabic ? 'عرض وتعديل حسابات المستخدمين' : 'View and edit user accounts',
      icon: Users,
      link: '/admin/users',
    },
    {
      title: isArabic ? 'إدارة العقارات' : 'Manage Properties',
      description: isArabic ? 'مراجعة وإدارة قوائم العقارات' : 'Review and manage property listings',
      icon: Building2,
      link: '/admin/properties',
    },
    {
      title: isArabic ? 'التحليلات' : 'Analytics',
      description: isArabic ? 'عرض التقارير والإحصائيات المفصلة' : 'View detailed reports and statistics',
      icon: TrendingUp,
      link: '/admin/analytics',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          {isArabic ? 'لوحة التحكم' : 'Admin Dashboard'}
        </h1>
        <p className="text-text-secondary mt-2">
          {isArabic
            ? 'مرحباً بك في لوحة إدارة المنصة'
            : 'Welcome to the platform administration panel'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* User Stats Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {isArabic ? 'المستخدمين حسب الدور' : 'Users by Role'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats?.byRole &&
                Object.entries(userStats.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-text-primary capitalize">{role}</span>
                    </div>
                    <span className="text-text-secondary font-medium">{count}</span>
                  </div>
                ))}
              {userStats && (
                <div className="pt-4 border-t border-background-tertiary">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      {isArabic ? 'جديد هذا الشهر' : 'New this month'}
                    </span>
                    <span className="text-primary font-bold">{userStats.newThisMonth || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              {isArabic ? 'العقارات حسب النوع' : 'Properties by Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyStats?.byType &&
                Object.entries(propertyStats.byType)
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-text-primary capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-text-secondary font-medium">{count}</span>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="flex items-center gap-4 p-4 rounded-lg bg-background-tertiary hover:bg-background-secondary transition-colors group"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <action.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">{action.title}</h3>
                  <p className="text-sm text-text-secondary">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors rtl:rotate-180" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { AdminDashboard };
