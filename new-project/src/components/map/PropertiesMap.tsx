import { useState, useCallback, useMemo } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMaps } from './GoogleMapsProvider';
import { MapMarker } from './MapMarker';
import { MapPin } from 'lucide-react';
import type { Property } from '@/types';

interface PropertiesMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect?: (id: string) => void;
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 24.7136, // Riyadh
  lng: 46.6753,
};

const defaultOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Helper to get coordinates from property
function getPropertyCoordinates(property: Property): { lat: number; lng: number } | null {
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
  return null;
}

export function PropertiesMap({
  properties,
  selectedPropertyId,
  onPropertySelect,
  className = '',
}: PropertiesMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Calculate bounds to fit all properties
  const bounds = useMemo(() => {
    if (!isLoaded || properties.length === 0) return null;

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoords = false;

    properties.forEach((property) => {
      const coords = getPropertyCoordinates(property);
      if (coords) {
        bounds.extend(coords);
        hasValidCoords = true;
      }
    });

    return hasValidCoords ? bounds : null;
  }, [properties, isLoaded]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);

      // Fit bounds if we have properties
      if (bounds) {
        map.fitBounds(bounds);

        // Don't zoom in too much for single properties
        const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const zoom = map.getZoom();
          if (zoom && zoom > 15) {
            map.setZoom(15);
          }
        });

        return () => google.maps.event.removeListener(listener);
      }
    },
    [bounds]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center bg-background-tertiary rounded-lg ${className}`}
      >
        <div className="text-center text-error p-4">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Error loading map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-background-tertiary rounded-lg animate-pulse ${className}`}
      >
        <div className="text-center text-text-muted">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50 animate-bounce" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={6}
        options={defaultOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {properties.map((property) => {
          const coords = getPropertyCoordinates(property);
          if (!coords) return null;

          return (
            <MapMarker
              key={property.id}
              property={property}
              isSelected={property.id === selectedPropertyId}
              onSelect={onPropertySelect}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}
