import { useRef, useEffect, useMemo, useCallback } from 'react';
import Map, { MapRef, Source, Layer } from 'react-map-gl/mapbox';
import type { MapLayerMouseEvent, LayerProps } from 'react-map-gl/mapbox';
import type { GeoJSONSource } from 'mapbox-gl';
import { useMapbox } from './MapboxProvider';
import { MapMarker } from './MapMarker';
import { MapPin } from 'lucide-react';
import type { Property } from '@/types';
import type { LngLatBoundsLike } from 'mapbox-gl';
import type { FeatureCollection, Point, Feature } from 'geojson';

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

// Cluster circle layer - color and size based on point count
const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  source: 'properties',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#C5A572', 10, '#1A1A2E', 50, '#0D0D1A'],
    'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
};

// Cluster count label
const clusterCountLayer: LayerProps = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'properties',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 14,
  },
  paint: {
    'text-color': '#ffffff',
  },
};

// Unclustered point layer
const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'properties',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#C5A572',
    'circle-radius': 10,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
};

export function PropertiesMap({
  properties,
  selectedPropertyId,
  onPropertySelect,
  className = '',
}: PropertiesMapProps) {
  const { accessToken, isReady } = useMapbox();
  const mapRef = useRef<MapRef>(null);

  // Convert properties to GeoJSON for clustering
  const geojsonData = useMemo((): FeatureCollection<Point> => {
    return {
      type: 'FeatureCollection',
      features: properties
        .map((property): Feature<Point> | null => {
          const coords = getPropertyCoordinates(property);
          if (!coords) return null;
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [coords.lng, coords.lat],
            },
            properties: {
              id: property.id,
              title: property.title,
              price: property.price,
              status: property.status,
            },
          };
        })
        .filter((f): f is Feature<Point> => f !== null),
    };
  }, [properties]);

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

  // Handle cluster click - zoom to expand
  const handleClusterClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature || !mapRef.current) return;

    const clusterId = feature.properties?.cluster_id;
    const source = mapRef.current.getSource('properties') as GeoJSONSource;

    if (!source || !clusterId) return;

    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || zoom === undefined || zoom === null) return;

      const geometry = feature.geometry as Point;
      mapRef.current?.easeTo({
        center: geometry.coordinates as [number, number],
        zoom: zoom,
        duration: 500,
      });
    });
  }, []);

  // Handle unclustered point click - select property
  const handlePointClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      const propertyId = feature.properties?.id;
      if (propertyId) {
        onPropertySelect?.(propertyId);
      }
    },
    [onPropertySelect]
  );

  // Handle map click
  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const features = event.features;
      if (!features || features.length === 0) return;

      const clusterFeature = features.find((f) => f.layer?.id === 'clusters');
      const pointFeature = features.find((f) => f.layer?.id === 'unclustered-point');

      if (clusterFeature) {
        handleClusterClick({ ...event, features: [clusterFeature] });
      } else if (pointFeature) {
        handlePointClick({ ...event, features: [pointFeature] });
      }
    },
    [handleClusterClick, handlePointClick]
  );

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

  // Find selected property for showing full marker with popup
  const selectedProperty = selectedPropertyId
    ? properties.find((p) => p.id === selectedPropertyId)
    : null;

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
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={handleMapClick}
        cursor="pointer"
      >
        <Source
          id="properties"
          type="geojson"
          data={geojsonData}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {/* Show full MapMarker with popup for selected property */}
        {selectedProperty && (
          <MapMarker
            property={selectedProperty}
            isSelected={true}
            onSelect={onPropertySelect}
          />
        )}
      </Map>
    </div>
  );
}
