import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getUserStats, getPropertyStats } from '@/services/adminService';
import type { UserStats, PropertyStats } from '@/services/adminService';

function AnalyticsPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [userResponse, propertyResponse] = await Promise.all([
        getUserStats(),
        getPropertyStats(),
      ]);
      setUserStats(userResponse.data);
      setPropertyStats(propertyResponse.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Generate mock trend data based on period
  const generateTrendData = () => {
    const data = [];
    const periods = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 12;
    const baseUsers = userStats?.total || 100;
    const baseProperties = propertyStats?.totalProperties || 50;

    for (let i = periods; i >= 0; i--) {
      const date = new Date();
      if (selectedPeriod === 'year') {
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short' }),
          users: Math.floor(baseUsers * (1 - i * 0.05) + Math.random() * 10),
          properties: Math.floor(baseProperties * (1 - i * 0.03) + Math.random() * 5),
          views: Math.floor(1000 + Math.random() * 500 - i * 20),
        });
      } else {
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
            month: 'short',
            day: 'numeric',
          }),
          users: Math.floor(baseUsers * (1 - i * 0.01) + Math.random() * 3),
          properties: Math.floor(baseProperties * (1 - i * 0.005) + Math.random() * 2),
          views: Math.floor(500 + Math.random() * 200 - i * 5),
        });
      }
    }
    return data;
  };

  const trendData = generateTrendData();

  // Property type distribution for pie chart
  const propertyTypeData = propertyStats?.byType
    ? Object.entries(propertyStats.byType).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value,
        color: ['#C5A572', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][index % 6],
      }))
    : [];

  // User role distribution for pie chart
  const userRoleData = userStats?.byRole
    ? Object.entries(userStats.byRole).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444'][index % 4],
      }))
    : [];

  // City distribution for bar chart
  const cityData = propertyStats?.byCity
    ? Object.entries(propertyStats.byCity)
        .slice(0, 6)
        .map(([name, value]) => ({
          name,
          value,
        }))
    : [];

  const periods = [
    { value: 'week', label: isArabic ? 'أسبوع' : 'Week' },
    { value: 'month', label: isArabic ? 'شهر' : 'Month' },
    { value: 'year', label: isArabic ? 'سنة' : 'Year' },
  ];

  const totalPieValue = propertyTypeData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {isArabic ? 'التحليلات' : 'Analytics'}
          </h1>
          <p className="text-text-secondary mt-2">
            {isArabic
              ? 'عرض التقارير والإحصائيات المفصلة'
              : 'View detailed reports and statistics'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-background-tertiary rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as 'week' | 'month' | 'year')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-primary text-background'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">
                  {isArabic ? 'إجمالي المستخدمين' : 'Total Users'}
                </p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {userStats?.total.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+{userStats?.newThisMonth || 0}</span>
                  <span className="text-xs text-text-muted">
                    {isArabic ? 'هذا الشهر' : 'this month'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">
                  {isArabic ? 'إجمالي العقارات' : 'Total Properties'}
                </p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {propertyStats?.totalProperties.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+12%</span>
                  <span className="text-xs text-text-muted">
                    {isArabic ? 'من الشهر الماضي' : 'from last month'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Building2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">
                  {isArabic ? 'المشاهدات' : 'Total Views'}
                </p>
                <p className="text-2xl font-bold text-text-primary mt-1">24.5K</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+8%</span>
                  <span className="text-xs text-text-muted">
                    {isArabic ? 'من الشهر الماضي' : 'from last month'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Eye className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">
                  {isArabic ? 'إجمالي القيمة' : 'Total Value'}
                </p>
                <p className="text-2xl font-bold text-text-primary mt-1">125M</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">-3%</span>
                  <span className="text-xs text-text-muted">
                    {isArabic ? 'من الشهر الماضي' : 'from last month'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {isArabic ? 'نمو المنصة' : 'Platform Growth'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="propertiesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A572" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C5A572" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelStyle={{ color: '#C5A572' }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#C5A572"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                  name={isArabic ? 'المشاهدات' : 'Views'}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#usersGradient)"
                  name={isArabic ? 'المستخدمين' : 'Users'}
                />
                <Area
                  type="monotone"
                  dataKey="properties"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fill="url(#propertiesGradient)"
                  name={isArabic ? 'العقارات' : 'Properties'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-text-secondary">
                {isArabic ? 'المشاهدات' : 'Views'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-text-secondary">
                {isArabic ? 'المستخدمين' : 'Users'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-text-secondary">
                {isArabic ? 'العقارات' : 'Properties'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'العقارات حسب النوع' : 'Properties by Type'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A2E',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [
                      `${value} (${((value / totalPieValue) * 100).toFixed(0)}%)`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {propertyTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-text-secondary truncate">{item.name}</span>
                  <span className="text-sm font-medium ms-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Roles Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'المستخدمين حسب الدور' : 'Users by Role'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A2E',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {userRoleData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-text-secondary truncate">{item.name}</span>
                  <span className="text-sm font-medium ms-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties by City Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'العقارات حسب المدينة' : 'Properties by City'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelStyle={{ color: '#C5A572' }}
                />
                <Bar dataKey="value" fill="#C5A572" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Listing Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-text-secondary text-sm">{isArabic ? 'للبيع' : 'For Sale'}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {propertyStats?.forSale || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-text-secondary text-sm">{isArabic ? 'للإيجار' : 'For Rent'}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {propertyStats?.forRent || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-text-secondary text-sm">{isArabic ? 'مميزة' : 'Featured'}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {propertyStats?.featured || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-text-secondary text-sm">{isArabic ? 'موثقين' : 'Verified Users'}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {userStats?.verified || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { AnalyticsPage };
