import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  Home,
  MapPin,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
  Star,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { propertyService } from '@/services/propertyService';
import type { Property } from '@/types';

function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const isArabic = i18n.language === 'ar';

  // Fetch featured properties on mount
  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        setLoading(true);
        const response = await propertyService.getProperties({ featured: true, limit: 6 });
        if (response.success && response.data) {
          setFeaturedProperties(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch featured properties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProperties();
  }, []);

  const stats = [
    { value: '1,500+', label: t('nav.properties'), icon: Building2 },
    { value: '500+', label: t('admin.users').replace('إدارة ', ''), icon: Users },
    { value: '50+', label: t('property.location'), icon: MapPin },
    { value: '98%', label: isArabic ? 'رضا العملاء' : 'Satisfaction', icon: TrendingUp },
  ];

  const features = [
    {
      icon: Search,
      title: isArabic ? 'بحث ذكي' : 'Smart Search',
      description: isArabic
        ? 'ابحث عن العقار المثالي بسهولة مع فلاتر متقدمة'
        : 'Find your perfect property easily with advanced filters',
    },
    {
      icon: Shield,
      title: isArabic ? 'موثوق وآمن' : 'Trusted & Secure',
      description: isArabic
        ? 'جميع العقارات موثقة ومعتمدة'
        : 'All properties are verified and certified',
    },
    {
      icon: Star,
      title: isArabic ? 'خدمة متميزة' : 'Premium Service',
      description: isArabic
        ? 'فريق دعم متخصص على مدار الساعة'
        : 'Dedicated support team available 24/7',
    },
  ];

  const propertyTypes = [
    { type: 'land', icon: MapPin, label: t('property.land') },
    { type: 'warehouse', icon: Building2, label: t('property.warehouse') },
    { type: 'storage', icon: Building2, label: t('property.storage') },
    { type: 'shipping_container', icon: Building2, label: t('property.shipping_container') },
    { type: 'aviation_hangar', icon: Building2, label: t('property.aviation_hangar') },
    { type: 'train_cargo', icon: Building2, label: t('property.train_cargo') },
    { type: 'office', icon: Building2, label: t('property.office') },
    { type: 'retail', icon: Building2, label: t('property.retail') },
  ];

  const handlePropertyClick = (id: string) => {
    navigate(`/properties/${id}`);
  };

  const handleFavorite = (id: string) => {
    console.log('Favorite property:', id);
    // TODO: Implement favorites API call
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background-secondary" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 start-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 end-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
              {isArabic ? (
                <>
                  اكتشف المساحة المثالية مع{' '}
                  <span className="text-primary">{t('common.appName')}</span>
                </>
              ) : (
                <>
                  Find Your Perfect Space with{' '}
                  <span className="text-primary">{t('common.appName')}</span>
                </>
              )}
            </h1>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              {isArabic
                ? 'المنصة العالمية للمساحات - أرض، مستودعات، تخزين، حاويات شحن، طيران، قطارات والمزيد'
                : 'Global Space Platform - Land, Warehouses, Storage, Shipping Containers, Aviation, Train Cargo & More'}
            </p>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-3 bg-background-secondary rounded-2xl">
                <div className="flex-1 relative">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isArabic ? 'ابحث بالمدينة أو الحي...' : 'Search by city or neighborhood...'}
                    className="w-full ps-12 pe-4 py-3 rounded-xl bg-background-tertiary border-0 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Link to={`/properties${searchQuery ? `?q=${searchQuery}` : ''}`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('common.search')}
                  </Button>
                </Link>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <Link to="/properties?status=for_sale">
                  <Button variant="outline" size="sm">
                    {t('property.forSale')}
                  </Button>
                </Link>
                <Link to="/properties?status=for_rent">
                  <Button variant="outline" size="sm">
                    {t('property.forRent')}
                  </Button>
                </Link>
                {propertyTypes.map((pt) => (
                  <Link key={pt.type} to={`/properties?type=${pt.type}`}>
                    <Button variant="ghost" size="sm">
                      {pt.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {isArabic ? 'مساحات مميزة' : 'Featured Spaces'}
              </h2>
              <p className="text-text-secondary">
                {isArabic
                  ? 'اكتشف أفضل المساحات المختارة لك'
                  : 'Discover the best spaces selected for you'}
              </p>
            </div>
            <Link to="/properties">
              <Button variant="outline">
                {isArabic ? 'عرض الكل' : 'View All'}
                <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={handlePropertyClick}
                  onFavorite={handleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-text-secondary">
              {isArabic ? 'لا توجد مساحات مميزة حالياً' : 'No featured spaces available'}
            </div>
          )}
        </div>
      </section>

      {/* Property Types */}
      <section className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">
              {isArabic ? 'تصفح حسب النوع' : 'Browse by Type'}
            </h2>
            <p className="text-text-secondary">
              {isArabic
                ? 'اختر نوع المساحة التي تبحث عنها'
                : 'Choose the type of space you are looking for'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyTypes.map((pt) => (
              <Link
                key={pt.type}
                to={`/properties?type=${pt.type}`}
                className="group p-6 rounded-xl bg-background hover:bg-primary transition-colors text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-background-secondary group-hover:bg-background/20 text-primary group-hover:text-background mb-4 transition-colors">
                  <pt.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold group-hover:text-background transition-colors">
                  {pt.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">
              {isArabic ? 'لماذا تختار سبيس؟' : 'Why Choose Space?'}
            </h2>
            <p className="text-text-secondary">
              {isArabic
                ? 'نقدم لك أفضل تجربة في البحث عن المساحات'
                : 'We offer you the best space search experience'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-background-secondary hover:bg-background-tertiary transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
            {isArabic ? 'هل لديك مساحة للبيع أو الإيجار؟' : 'Have a space to sell or rent?'}
          </h2>
          <p className="text-background/80 mb-8 max-w-2xl mx-auto">
            {isArabic
              ? 'انضم إلى منصة سبيس واعرض مساحتك لآلاف المشترين والمستأجرين حول العالم'
              : 'Join Space platform and showcase your space to thousands of potential buyers and renters worldwide'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                {isArabic ? 'سجل الآن' : 'Register Now'}
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-background text-background hover:bg-background hover:text-primary"
              >
                {t('nav.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export { HomePage };
