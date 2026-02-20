import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Building2,
  DollarSign,
  MessageSquare,
  Star,
  Target,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

function PerformancePage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Mock performance data
  const performanceStats = {
    totalListings: 12,
    activeListings: 10,
    totalViews: 4892,
    viewsChange: 18,
    totalLeads: 48,
    leadsChange: 12,
    closedDeals: 8,
    dealsChange: 25,
    totalRevenue: 125000,
    revenueChange: 15,
    avgResponseTime: '2.5 hrs',
    responseTimeChange: -10,
    conversionRate: 16.7,
    conversionChange: 3,
    customerRating: 4.8,
    ratingCount: 24,
  };

  // Views and leads over time
  const trendData = [
    { period: 'Jan', views: 320, leads: 8, deals: 1 },
    { period: 'Feb', views: 420, leads: 12, deals: 1 },
    { period: 'Mar', views: 380, leads: 10, deals: 2 },
    { period: 'Apr', views: 520, leads: 15, deals: 1 },
    { period: 'May', views: 480, leads: 14, deals: 2 },
    { period: 'Jun', views: 620, leads: 18, deals: 1 },
    { period: 'Jul', views: 580, leads: 16, deals: 0 },
    { period: 'Aug', views: 750, leads: 22, deals: 2 },
    { period: 'Sep', views: 680, leads: 19, deals: 1 },
    { period: 'Oct', views: 820, leads: 24, deals: 2 },
    { period: 'Nov', views: 780, leads: 21, deals: 1 },
    { period: 'Dec', views: 920, leads: 28, deals: 2 },
  ];

  // Lead sources
  const leadSourceData = [
    { name: 'Website', value: 45, color: '#C5A572' },
    { name: 'Referral', value: 25, color: '#22C55E' },
    { name: 'Social Media', value: 18, color: '#3B82F6' },
    { name: 'Direct', value: 12, color: '#F59E0B' },
  ];

  // Property performance
  const propertyPerformance = [
    { name: isArabic ? 'فيلا الرياض' : 'Riyadh Villa', views: 856, leads: 12, conversion: 14 },
    { name: isArabic ? 'شقة جدة' : 'Jeddah Apt', views: 642, leads: 8, conversion: 12 },
    { name: isArabic ? 'مكتب الدمام' : 'Dammam Office', views: 423, leads: 5, conversion: 12 },
    { name: isArabic ? 'أرض تجارية' : 'Commercial Land', views: 312, leads: 3, conversion: 10 },
  ];

  // Goals
  const goals = [
    { name: isArabic ? 'صفقات الشهر' : 'Monthly Deals', current: 2, target: 3, unit: '' },
    { name: isArabic ? 'عملاء جدد' : 'New Leads', current: 28, target: 30, unit: '' },
    { name: isArabic ? 'المشاهدات' : 'Views', current: 920, target: 1000, unit: '' },
    { name: isArabic ? 'الإيرادات' : 'Revenue', current: 125, target: 150, unit: 'K' },
  ];

  const periods = [
    { value: 'week', label: isArabic ? 'أسبوع' : 'Week' },
    { value: 'month', label: isArabic ? 'شهر' : 'Month' },
    { value: 'quarter', label: isArabic ? 'ربع سنة' : 'Quarter' },
    { value: 'year', label: isArabic ? 'سنة' : 'Year' },
  ];

  const totalLeadSources = leadSourceData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {isArabic ? 'تقارير الأداء' : 'Performance Reports'}
          </h1>
          <p className="text-text-secondary mt-2">
            {isArabic
              ? 'تتبع أدائك ومقاييسك الرئيسية'
              : 'Track your performance and key metrics'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-background-tertiary rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as typeof selectedPeriod)}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${performanceStats.viewsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {performanceStats.viewsChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(performanceStats.viewsChange)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-3">
              {performanceStats.totalViews.toLocaleString()}
            </p>
            <p className="text-text-secondary text-sm">
              {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${performanceStats.leadsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {performanceStats.leadsChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(performanceStats.leadsChange)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-3">
              {performanceStats.totalLeads}
            </p>
            <p className="text-text-secondary text-sm">
              {isArabic ? 'إجمالي العملاء' : 'Total Leads'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${performanceStats.dealsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {performanceStats.dealsChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(performanceStats.dealsChange)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-3">
              {performanceStats.closedDeals}
            </p>
            <p className="text-text-secondary text-sm">
              {isArabic ? 'صفقات مغلقة' : 'Closed Deals'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Target className="w-5 h-5 text-yellow-500" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${performanceStats.conversionChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {performanceStats.conversionChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(performanceStats.conversionChange)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-3">
              {performanceStats.conversionRate}%
            </p>
            <p className="text-text-secondary text-sm">
              {isArabic ? 'معدل التحويل' : 'Conversion Rate'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views & Leads Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'المشاهدات والعملاء' : 'Views & Leads Trend'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A572" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C5A572" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                  <XAxis dataKey="period" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A2E',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#C5A572" strokeWidth={2} fill="url(#viewsGrad)" name={isArabic ? 'المشاهدات' : 'Views'} />
                  <Area type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} fill="url(#leadsGrad)" name={isArabic ? 'العملاء' : 'Leads'} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-text-secondary">{isArabic ? 'المشاهدات' : 'Views'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-text-secondary">{isArabic ? 'العملاء' : 'Leads'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'مصادر العملاء' : 'Lead Sources'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {leadSourceData.map((entry, index) => (
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
                    formatter={(value: number) => [`${value} (${((value / totalLeadSources) * 100).toFixed(0)}%)`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {leadSourceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-text-secondary truncate">{item.name}</span>
                  <span className="text-sm font-medium ms-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'أداء العقارات' : 'Property Performance'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="views" fill="#C5A572" radius={[4, 4, 0, 0]} name={isArabic ? 'المشاهدات' : 'Views'} />
                <Bar dataKey="leads" fill="#3B82F6" radius={[4, 4, 0, 0]} name={isArabic ? 'العملاء' : 'Leads'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Goals & Rating */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {isArabic ? 'الأهداف الشهرية' : 'Monthly Goals'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">{goal.name}</span>
                      <span className="text-text-primary font-medium">
                        {goal.current}{goal.unit} / {goal.target}{goal.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-primary' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rating & Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {isArabic ? 'التقييم والاستجابة' : 'Rating & Response'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Rating */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.floor(performanceStats.customerRating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-3xl font-bold text-text-primary">{performanceStats.customerRating}</p>
                <p className="text-text-secondary text-sm">
                  {isArabic ? `${performanceStats.ratingCount} تقييم` : `${performanceStats.ratingCount} reviews`}
                </p>
              </div>

              {/* Response Time */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <p className="text-3xl font-bold text-text-primary">{performanceStats.avgResponseTime}</p>
                <p className="text-text-secondary text-sm">
                  {isArabic ? 'متوسط وقت الرد' : 'Avg Response Time'}
                </p>
                <Badge
                  variant={performanceStats.responseTimeChange < 0 ? 'success' : 'error'}
                  size="sm"
                  className="mt-2"
                >
                  {performanceStats.responseTimeChange < 0 ? '↓' : '↑'} {Math.abs(performanceStats.responseTimeChange)}%
                </Badge>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-background-tertiary">
              <div>
                <p className="text-text-secondary text-sm">{isArabic ? 'القوائم النشطة' : 'Active Listings'}</p>
                <p className="text-xl font-bold text-text-primary">{performanceStats.activeListings}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">{isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                <p className="text-xl font-bold text-text-primary">
                  {performanceStats.totalRevenue.toLocaleString()} SAR
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { PerformancePage };
