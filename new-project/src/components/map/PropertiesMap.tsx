import { useRef, useEffect, useMemo } from 'react';
import Map, { MapRef } from 'react-map-gl/mapbox';
import { useMapbox } from './MapboxProvider';
import { MapMarker } from './MapMarker';
import { MapPin } from 'lucide-react';
import type { Property } from '@/types';
import type { LngLatBoundsLike } from 'mapbox-gl';

interface PropertiesMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect?: (id: string) => void;
  className?: string;
}

const defaultCenter = {
  lat: 24.7136, // Riyadh
  lng: 46.6753,
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
  const { accessToken, isReady } = useMapbox();
  const mapRef = useRef<MapRef>(null);

  // Calculate bounds to fit all properties
  const bounds = useMemo((): LngLatBoundsLike | null => {
    if (properties.length === 0) return null;

    let minLng = Infinity,
      maxLng = -Infinity;
    let minLat = Infinity,
      maxLat = -Infinity;
    let hasValidCoords = false;

    properties.forEach((property) => {
      const coords = getPropertyCoordinates(property);
      if (coords) {
        minLng = Math.min(minLng, coords.lng);
        maxLng = Math.max(maxLng, coords.lng);
        minLat = Math.min(minLat, coords.lat);
        maxLat = Math.max(maxLat, coords.lat);
        hasValidCoords = true;
      }
    });

    if (!hasValidCoords) return null;

    // Add small padding if all points are the same
    if (minLng === maxLng && minLat === maxLat) {
      const padding = 0.01;
      return [
        [minLng - padding, minLat - padding],
        [maxLng + padding, maxLat + padding],
      ];
    }

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ];
  }, [properties]);

  // Fit bounds when properties change
  useEffect(() => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000,
      });
    }
  }, [bounds]);

  if (!isReady) {
    return (
      <div
        className={`flex items-center justify-center bg-background-tertiary rounded-lg ${className}`}
      >
        <div className="text-center text-text-muted p-4">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Map not configured</p>
          <p className="text-sm mt-1">Add VITE_MAPBOX_ACCESS_TOKEN to enable maps</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={accessToken}
        initialViewState={{
          longitude: defaultCenter.lng,
          latitude: defaultCenter.lat,
          zoom: 6,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
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
      </Map>
    </div>
  );
}
