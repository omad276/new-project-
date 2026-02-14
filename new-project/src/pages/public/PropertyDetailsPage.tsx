import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { PropertyMap } from '@/components/map';
import { cn, formatPrice, formatArea } from '@/lib/utils';
import type { Property, PropertyStatus } from '@/types';
import type { BadgeProps } from '@/components/ui/Badge';

// Mock property data
const mockProperty: Property = {
  id: '1',
  title: 'Luxury Villa in Riyadh',
  titleAr: 'فيلا فاخرة في الرياض',
  description:
    'This stunning 5-bedroom villa offers the perfect blend of luxury and comfort. Located in the prestigious Al Olaya District, this property features a private swimming pool, landscaped garden, and modern amenities throughout. The villa spans 450 square meters of living space with high ceilings, marble flooring, and floor-to-ceiling windows that flood the interior with natural light.',
  descriptionAr:
    'تقدم هذه الفيلا الرائعة المكونة من 5 غرف نوم المزيج المثالي من الفخامة والراحة. تقع في حي العليا المرموق، وتتميز هذه العقار بمسبح خاص وحديقة منسقة ووسائل راحة حديثة في جميع أنحائها. تمتد الفيلا على مساحة 450 متر مربع من المساحة المعيشية مع أسقف عالية وأرضيات رخامية ونوافذ ممتدة من الأرض حتى السقف.',
  type: 'villa',
  status: 'for_sale',
  price: 2500000,
  currency: 'SAR',
  area: 450,
  bedrooms: 5,
  bathrooms: 4,
  location: {
    address: 'Al Olaya District, King Fahd Road',
    addressAr: 'حي العليا، طريق الملك فهد',
    city: 'Riyadh',
    cityAr: 'الرياض',
    country: 'Saudi Arabia',
    countryAr: 'السعودية',
    latitude: 24.7136,
    longitude: 46.6753,
  },
  images: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200',
  ],
  features: [
    'Private Pool',
    'Garden',
    'Garage (3 cars)',
    'Smart Home System',
    'Central AC',
    'Maid Room',
    'Driver Room',
    'Security System',
    'Backup Generator',
  ],
  ownerId: '1',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

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

  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // In real app, fetch property by id from API
  // For now, using mock data. propertyId would be used to fetch: `/api/properties/${propertyId}`
  const property = mockProperty;
  const agent = mockAgent;

  // Log propertyId for debugging (remove in production)
  console.debug('Viewing property:', propertyId);

  const title = isArabic ? property.titleAr : property.title;
  const description = isArabic ? property.descriptionAr : property.description;
  const address = isArabic
    ? `${property.location.addressAr}، ${property.location.cityAr}`
    : `${property.location.address}, ${property.location.city}`;
  const agentName = isArabic ? agent.nameAr : agent.name;

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
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
            <ImageGallery images={property.images} alt={title} />

            {/* Property Header */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={statusVariants[property.status]}>
                      {statusLabels[property.status]}
                    </Badge>
                    <Badge variant="default">{t(`property.${property.type}`)}</Badge>
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
                    {property.createdAt.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
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

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'المميزات' : 'Features'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.features.map((feature, index) => (
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

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>{t('property.location')}</CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyMap
                  lat={property.location.latitude}
                  lng={property.location.longitude}
                  address={address}
                  title={title}
                  className="aspect-video"
                />
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
                  <h4 className="font-medium mb-3">
                    {isArabic ? 'جدولة زيارة' : 'Schedule a Visit'}
                  </h4>
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
                  isArabic
                    ? 'أنا مهتم بهذا العقار...'
                    : "I'm interested in this property..."
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
