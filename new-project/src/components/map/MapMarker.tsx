import { useState } from 'react';
import { Marker, Popup } from 'react-map-gl';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bed, Bath, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatArea } from '@/lib/utils';
import type { Property, PropertyStatus } from '@/types';
import type { BadgeProps } from '@/components/ui/Badge';

interface MapMarkerProps {
  property: Property;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function MapMarker({ property, isSelected = false, onSelect }: MapMarkerProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(isSelected);

  const isArabic = i18n.language === 'ar';
  const title = isArabic ? property.titleAr : property.title;
  const address = isArabic
    ? `${property.location.addressAr}, ${property.location.cityAr}`
    : `${property.location.address}, ${property.location.city}`;

  const statusVariants: Record<PropertyStatus, BadgeProps['variant']> = {
    for_sale: 'primary',
    for_rent: 'success',
    off_plan: 'info',
    investment: 'secondary',
    sold: 'error',
    rented: 'warning',
  };

  const statusLabels: Record<PropertyStatus, string> = {
    for_sale: isArabic ? 'للبيع' : 'For Sale',
    for_rent: isArabic ? 'للإيجار' : 'For Rent',
    off_plan: isArabic ? 'على الخارطة' : 'Off Plan',
    investment: isArabic ? 'استثمار' : 'Investment',
    sold: isArabic ? 'تم البيع' : 'Sold',
    rented: isArabic ? 'تم التأجير' : 'Rented',
  };

  // Get coordinates - handle both old format (lat/lng) and new format (coordinates array)
  const getCoordinates = () => {
    const loc = property.location;
    if ('coordinates' in loc && loc.coordinates?.coordinates) {
      return {
        lat: loc.coordinates.coordinates[1],
        lng: loc.coordinates.coordinates[0],
      };
    }
    // Fallback for old format
    if ('latitude' in loc && 'longitude' in loc) {
      return {
        lat: (loc as { latitude: number; longitude: number }).latitude,
        lng: (loc as { latitude: number; longitude: number }).longitude,
      };
    }
    return { lat: 24.7136, lng: 46.6753 }; // Default to Riyadh
  };

  const position = getCoordinates();

  const handleClick = (e: { originalEvent: MouseEvent }) => {
    e.originalEvent.stopPropagation();
    setShowInfo(true);
    onSelect?.(property.id);
  };

  const handleViewDetails = () => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <>
      <Marker
        longitude={position.lng}
        latitude={position.lat}
        anchor="bottom"
        onClick={handleClick}
      >
        <div className="cursor-pointer transition-transform hover:scale-110">
          <svg width="40" height="50" viewBox="0 0 40 50">
            <path
              d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z"
              fill={isSelected ? '#C5A572' : '#1A1A2E'}
            />
            <circle cx="20" cy="18" r="8" fill="white" />
          </svg>
        </div>
      </Marker>

      {showInfo && (
        <Popup
          longitude={position.lng}
          latitude={position.lat}
          anchor="bottom"
          onClose={() => setShowInfo(false)}
          closeButton={true}
          closeOnClick={false}
          offset={[0, -50]}
          maxWidth="300px"
        >
          <div className="p-2 min-w-[250px] max-w-[300px]">
            {/* Image */}
            {property.images?.[0] && (
              <img
                src={property.images[0]}
                alt={title}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
            )}

            {/* Status Badge */}
            <div className="mb-2">
              <Badge variant={statusVariants[property.status]} size="sm">
                {statusLabels[property.status]}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{title}</h3>

            {/* Address */}
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{address}</p>

            {/* Price */}
            <div className="text-lg font-bold text-primary mb-2">
              {formatPrice(property.price, property.currency, isArabic ? 'ar-SA' : 'en-US')}
            </div>

            {/* Features */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
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
                <span>{formatArea(property.area, isArabic ? 'ar-SA' : 'en-US')}</span>
              </div>
            </div>

            {/* View Button */}
            <Button size="sm" fullWidth onClick={handleViewDetails}>
              {isArabic ? 'عرض التفاصيل' : 'View Details'}
            </Button>
          </div>
        </Popup>
      )}
    </>
  );
}
