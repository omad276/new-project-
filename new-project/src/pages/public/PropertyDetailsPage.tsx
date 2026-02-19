import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar,
  Check,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { PropertyMap } from '@/components/map';
import { PropertyReportModal } from '@/components/reports';
import { cn, formatPrice, formatArea } from '@/lib/utils';
import { api } from '@/lib/api';
import type { PropertyStatus } from '@/types';
import type { BadgeProps } from '@/components/ui/Badge';
import type { PropertyReportData } from '@/lib/reportGenerator';

// Property type from API
interface PropertyData {
  _id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  type: string;
  status: string;
  price: number;
  currency: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: {
    address?: string;
    addressAr?: string;
    city?: string;
    cityAr?: string;
    country?: string;
    countryAr?: string;
    coordinates?: {
      type: string;
      coordinates: [number, number]; // [lng, lat]
    };
  };
  images: string[];
  features?: string[];
  featuresAr?: string[];
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

const mockAgent = {
  id: '1',
  name: 'Mohammed Al-Rashid',
  nameAr: 'محمد الراشد',
  email: 'mohammed@upgreat.com',
  phone: '+966 50 123 4567',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  listings: 45,
  rating: 4.8,
};

function PropertyDetailsPage() {
  const { t, i18n } = useTranslation();
  const { id: propertyId } = useParams<{ id: string }>();
  const isArabic = i18n.language === 'ar';

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const agent = mockAgent;

  // Fetch property data from API
  useEffect(() => {
    async function fetchProperty() {
      if (!propertyId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<PropertyData>(`/properties/${propertyId}`);

        if (response.success && response.data) {
          setProperty(response.data);
        } else {
          setError(response.message || 'Property not found');
        }
      } catch {
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-error">
          {isArabic ? 'العقار غير موجود' : 'Property Not Found'}
        </h2>
        <p className="text-text-secondary">{error}</p>
        <Link to="/properties">
          <Button>{isArabic ? 'العودة للعقارات' : 'Back to Properties'}</Button>
        </Link>
      </div>
    );
  }

  const title = isArabic ? property.titleAr || property.title : property.title;
  const description = isArabic
    ? property.descriptionAr || property.description
    : property.description;
  const address = isArabic
    ? `${property.location.addressAr || property.location.address || ''}, ${property.location.cityAr || property.location.city || ''}`
    : `${property.location.address || ''}, ${property.location.city || ''}`;
  const agentName = isArabic ? agent.nameAr : agent.name;
  const features = isArabic
    ? property.featuresAr || property.features || []
    : property.features || [];

  // Get coordinates (GeoJSON format: [lng, lat])
  const lng = property.location.coordinates?.coordinates?.[0] || 46.6753;
  const lat = property.location.coordinates?.coordinates?.[1] || 24.7136;

  // Map status to display format
  const statusMap: Record<string, PropertyStatus> = {
    for_sale: 'for_sale',
    for_rent: 'for_rent',
    sold: 'sold',
    rented: 'rented',
  };
  const propertyStatus = statusMap[property.status] || 'for_sale';

  const statusLabels: Record<PropertyStatus, string> = {
    for_sale: t('property.forSale'),
    for_rent: t('property.forRent'),
    sold: isArabic ? 'تم البيع' : 'Sold',
    rented: isArabic ? 'تم التأجير' : 'Rented',
  };

  const statusVariants: Record<PropertyStatus, BadgeProps['variant']> = {
    for_sale: 'primary',
    for_rent: 'success',
    sold: 'error',
    rented: 'warning',
  };

  // Build images array - use uploaded images or placeholder
  const images =
    property.images.length > 0
      ? property.images.map((img) =>
          img.startsWith('http') ? img : `http://localhost:3002/${img}`
        )
      : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || '',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isArabic ? 'تم نسخ الرابط!' : 'Link copied!');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    setShowContactModal(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {isArabic ? 'العودة إلى العقارات' : 'Back to Properties'}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <ImageGallery images={images} alt={title} />

            {/* Property Header */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={statusVariants[propertyStatus]}>
                      {statusLabels[propertyStatus]}
                    </Badge>
                    <Badge variant="default">{t(`property.${property.type}`) || property.type}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold">{title}</h1>
                  <div className="flex items-center gap-2 text-text-secondary mt-2">
                    <MapPin className="w-5 h-5" />
                    <span>{address}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={cn(isFavorite && 'text-error border-error')}
                  >
                    <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" onClick={() => setShowReportModal(true)}>
                    <FileText className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary">
                {formatPrice(property.price, property.currency, isArabic ? 'ar-SA' : 'en-US')}
                {property.status === 'for_rent' && (
                  <span className="text-lg text-text-muted font-normal">
                    {' '}
                    / {isArabic ? 'شهرياً' : 'month'}
                  </span>
                )}
              </div>
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-6 p-6 bg-background-secondary rounded-xl">
              {property.bedrooms !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-background-tertiary">
                    <Bed className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{property.bedrooms}</div>
                    <div className="text-sm text-text-secondary">{t('property.bedrooms')}</div>
                  </div>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-background-tertiary">
                    <Bath className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{property.bathrooms}</div>
                    <div className="text-sm text-text-secondary">{t('property.bathrooms')}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-background-tertiary">
                  <Maximize className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatArea(property.area, isArabic ? 'ar-SA' : 'en-US')}
                  </div>
                  <div className="text-sm text-text-secondary">{t('property.sqm')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-background-tertiary">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {new Date(property.createdAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {isArabic ? 'تاريخ الإضافة' : 'Listed'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {description && (
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? 'الوصف' : 'Description'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? 'المميزات' : 'Features'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-success/10">
                          <Check className="w-4 h-4 text-success" />
                        </div>
                        <span className="text-text-secondary">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle>{t('property.location')}</CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyMap lat={lat} lng={lng} address={address} title={title} className="aspect-video" />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar src={agent.avatar} name={agentName} size="lg" />
                  <div>
                    <h3 className="font-semibold">{agentName}</h3>
                    <p className="text-sm text-text-secondary">
                      {isArabic ? 'وكيل عقاري' : 'Real Estate Agent'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-warning">★</span>
                      <span className="text-sm font-medium">{agent.rating}</span>
                      <span className="text-sm text-text-muted">
                        ({agent.listings} {isArabic ? 'عقار' : 'listings'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button fullWidth onClick={() => setShowContactModal(true)}>
                    <Mail className="w-5 h-5" />
                    {isArabic ? 'إرسال رسالة' : 'Send Message'}
                  </Button>
                  <Button variant="outline" fullWidth>
                    <Phone className="w-5 h-5" />
                    {agent.phone}
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-background-tertiary">
                  <h4 className="font-medium mb-3">{isArabic ? 'جدولة زيارة' : 'Schedule a Visit'}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['Sat', 'Sun', 'Mon'].map((day) => (
                      <button
                        key={day}
                        className="p-2 text-sm rounded-lg border border-background-tertiary hover:border-primary hover:text-primary transition-colors"
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Property Report Modal */}
      <PropertyReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        property={{
          title: title,
          type: property.type,
          status: property.status,
          price: property.price,
          currency: property.currency,
          area: property.area,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          address: property.location.address || '',
          city: property.location.city || '',
          country: property.location.country || 'Saudi Arabia',
          description: description,
          features: features,
          images: images,
          listedDate: new Date(property.createdAt),
          agentName: agentName,
          agentPhone: agent.phone,
          agentEmail: agent.email,
        }}
        isArabic={isArabic}
      />

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={isArabic ? 'تواصل مع الوكيل' : 'Contact Agent'}
        description={
          isArabic
            ? `أرسل رسالة إلى ${agentName} حول هذا العقار`
            : `Send a message to ${agentName} about this property`
        }
      >
        <form onSubmit={handleContactSubmit}>
          <div className="space-y-4">
            <Input
              label={isArabic ? 'الاسم' : 'Name'}
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              required
            />
            <Input
              label={t('auth.email')}
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              required
            />
            <Input
              label={t('auth.phone')}
              type="tel"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                {isArabic ? 'الرسالة' : 'Message'}
              </label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg bg-background-secondary border border-background-tertiary text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder={
                  isArabic ? 'أنا مهتم بهذا العقار...' : "I'm interested in this property..."
                }
                required
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowContactModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('common.submit')}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

export { PropertyDetailsPage };
