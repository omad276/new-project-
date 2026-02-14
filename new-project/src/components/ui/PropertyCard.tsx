import { useTranslation } from 'react-i18next';
import { Heart, MapPin, Bed, Bath, Maximize, Share2 } from 'lucide-react';
import { cn, formatPrice, formatArea } from '@/lib/utils';
import { Badge } from './Badge';
import type { BadgeProps } from './Badge';
import type { Property, PropertyStatus } from '@/types';

export interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
  onClick?: (id: string) => void;
  isFavorite?: boolean;
  className?: string;
}

function PropertyCard({
  property,
  onFavorite,
  onShare,
  onClick,
  isFavorite = false,
  className,
}: PropertyCardProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const title = isArabic ? property.titleAr : property.title;
  const location = isArabic
    ? `${property.location.cityAr}, ${property.location.countryAr}`
    : `${property.location.city}, ${property.location.country}`;

  const statusLabels: Record<PropertyStatus, string> = {
    for_sale: isArabic ? 'للبيع' : 'For Sale',
    for_rent: isArabic ? 'للإيجار' : 'For Rent',
    off_plan: isArabic ? 'على المخطط' : 'Off-Plan',
    investment: isArabic ? 'استثمار' : 'Investment',
    sold: isArabic ? 'مباع' : 'Sold',
    rented: isArabic ? 'مؤجر' : 'Rented',
  };

  const statusVariants: Record<PropertyStatus, BadgeProps['variant']> = {
    for_sale: 'primary',
    for_rent: 'success',
    off_plan: 'warning',
    investment: 'info',
    sold: 'error',
    rented: 'secondary',
  };

  return (
    <article
      className={cn(
        'group rounded-xl overflow-hidden bg-background-secondary',
        'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={() => onClick?.(property.id)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0] || '/placeholder-property.jpg'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Status Badge */}
        <div className="absolute top-3 start-3">
          <Badge variant={statusVariants[property.status]}>
            {statusLabels[property.status]}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 end-3 flex gap-2">
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(property.id);
              }}
              className="p-2 rounded-full bg-background/80 text-text-primary hover:bg-background transition-colors"
              aria-label="Share property"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(property.id);
              }}
              className={cn(
                'p-2 rounded-full bg-background/80 transition-colors',
                isFavorite ? 'text-error' : 'text-text-primary hover:text-error'
              )}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
            </button>
          )}
        </div>

        {/* Image Count */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 end-3 px-2 py-1 rounded-full bg-background/80 text-xs text-text-primary">
            +{property.images.length - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-text-primary line-clamp-1 mb-1">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-text-secondary text-sm mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-text-secondary text-sm mb-4">
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span>
              {formatArea(property.area, isArabic ? 'ar-SA' : 'en-US')} {t('property.sqm')}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrice(property.price, property.currency, isArabic ? 'ar-SA' : 'en-US')}
          </span>
          {property.status === 'for_rent' && (
            <span className="text-sm text-text-muted">/ {t('property.month', 'month')}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export { PropertyCard };
