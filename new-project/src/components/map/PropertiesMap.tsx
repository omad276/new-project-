import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import Map, { MapRef, Source, Layer, GeolocateControl } from 'react-map-gl/mapbox';
import type { MapLayerMouseEvent, LayerProps } from 'react-map-gl/mapbox';
import type { GeoJSONSource } from 'mapbox-gl';
import { useMapbox } from './MapboxProvider';
import { MapMarker } from './MapMarker';
import { DrawControl } from './DrawControl';
import type { DrawCreateEvent, DrawUpdateEvent, DrawDeleteEvent } from './DrawControl';
import { MapStyleControl } from './MapStyleControl';
import { MapPin } from 'lucide-react';
import type { Property } from '@/types';
import type { LngLatBoundsLike } from 'mapbox-gl';
import type { FeatureCollection, Point, Feature } from 'geojson';

export type MapViewMode = 'clusters' | 'heatmap';
export type MapStyle = 'streets' | 'dark' | 'light' | 'satellite' | 'satellite-streets' | 'outdoors';

const MAP_STYLES: Record<MapStyle, string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  'satellite-streets': 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};

interface PropertiesMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect?: (id: string) => void;
  className?: string;
  viewMode?: MapViewMode;
  enableDrawing?: boolean;
  onDrawCreate?: (features: Feature[]) => void;
  onDrawUpdate?: (features: Feature[]) => void;
  onDrawDelete?: (features: Feature[]) => void;
  showGeolocation?: boolean;
  onGeolocate?: (position: { longitude: number; latitude: number }) => void;
  mapStyle?: MapStyle;
  showStyleControl?: boolean;
  onStyleChange?: (style: MapStyle) => void;
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

// ============================================
// Cluster Layers
// ============================================

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

// ============================================
// Heatmap Layers
// ============================================

// Heatmap layer - shows property density
const heatmapLayer: LayerProps = {
  id: 'heatmap',
  type: 'heatmap',
  source: 'properties-heatmap',
  maxzoom: 15,
  paint: {
    // Weight of each point
    'heatmap-weight': 1,
    // Increase intensity as zoom level increases
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
    // Color gradient from transparent to blue to red
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(0,0,0,0)',
      0.2,
      'rgba(103,169,207,0.6)',
      0.4,
      'rgba(209,229,240,0.7)',
      0.6,
      'rgba(253,219,199,0.8)',
      0.8,
      'rgba(239,138,98,0.9)',
      1,
      'rgba(178,24,43,1)',
    ],
    // Radius increases with zoom
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
    // Fade out at high zoom to reveal points
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 12, 1, 15, 0],
  },
};

// Point layer shown at high zoom when heatmap fades
const heatmapPointLayer: LayerProps = {
  id: 'heatmap-point',
  type: 'circle',
  source: 'properties-heatmap',
  minzoom: 12,
  paint: {
    'circle-radius': 8,
    'circle-color': '#C5A572',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0, 14, 1],
  },
};

export function PropertiesMap({
  properties,
  selectedPropertyId,
  onPropertySelect,
  className = '',
  viewMode = 'clusters',
  enableDrawing = false,
  onDrawCreate,
  onDrawUpdate,
  onDrawDelete,
  showGeolocation = false,
  onGeolocate,
  mapStyle,
  showStyleControl = false,
  onStyleChange,
}: PropertiesMapProps) {
  const { accessToken, isReady } = useMapbox();
  const [internalStyle, setInternalStyle] = useState<MapStyle>(mapStyle ?? 'streets');
  const currentStyle = mapStyle ?? internalStyle;
  const mapRef = useRef<MapRef>(null);

  // Convert properties to GeoJSON
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

  // Handle point click - select property
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

  // Handle map click based on view mode
  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const features = event.features;
      if (!features || features.length === 0) return;

      if (viewMode === 'heatmap') {
        // In heatmap mode, only handle point clicks at high zoom
        const pointFeature = features.find((f) => f.layer?.id === 'heatmap-point');
        if (pointFeature?.properties?.id) {
          onPropertySelect?.(pointFeature.properties.id);
        }
      } else {
        // In cluster mode, handle both cluster and point clicks
        const clusterFeature = features.find((f) => f.layer?.id === 'clusters');
        const pointFeature = features.find((f) => f.layer?.id === 'unclustered-point');

        if (clusterFeature) {
          handleClusterClick({ ...event, features: [clusterFeature] });
        } else if (pointFeature) {
          handlePointClick({ ...event, features: [pointFeature] });
        }
      }
    },
    [viewMode, handleClusterClick, handlePointClick, onPropertySelect]
  );

  // Interactive layer IDs based on view mode
  const interactiveLayerIds =
    viewMode === 'heatmap' ? ['heatmap-point'] : ['clusters', 'unclustered-point'];

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
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={accessToken}
        initialViewState={{
          longitude: defaultCenter.lng,
          latitude: defaultCenter.lat,
          zoom: 6,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLES[currentStyle]}
        interactiveLayerIds={interactiveLayerIds}
        onClick={handleMapClick}
        cursor="pointer"
      >
        {/* Heatmap Mode */}
        {viewMode === 'heatmap' && (
          <Source id="properties-heatmap" type="geojson" data={geojsonData}>
            <Layer {...heatmapLayer} />
            <Layer {...heatmapPointLayer} />
          </Source>
        )}

        {/* Cluster Mode */}
        {viewMode === 'clusters' && (
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
        )}

        {/* Show full MapMarker with popup for selected property */}
        {selectedProperty && (
          <MapMarker property={selectedProperty} isSelected={true} onSelect={onPropertySelect} />
        )}

        {/* Drawing Tools */}
        {/* Drawing Tools */}
        {enableDrawing && (
          <DrawControl
            position="top-left"
            controls={{
              polygon: true,
              trash: true,
            }}
            onCreate={(e: DrawCreateEvent) => onDrawCreate?.(e.features)}
            onUpdate={(e: DrawUpdateEvent) => onDrawUpdate?.(e.features)}
            onDelete={(e: DrawDeleteEvent) => onDrawDelete?.(e.features)}
          />
        )}

        {/* Geolocation Control */}
        {showGeolocation && (
          <GeolocateControl
            position="top-right"
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
            showUserHeading={true}
            showAccuracyCircle={true}
            onGeolocate={(e) => {
              onGeolocate?.({
                longitude: e.coords.longitude,
                latitude: e.coords.latitude,
              });
            }}
          />
        )}
      </Map>

      {/* Map Style Control */}
      {showStyleControl && (
        <MapStyleControl
          value={currentStyle}
          onChange={(style) => {
            setInternalStyle(style);
            onStyleChange?.(style);
          }}
        />
      )}
    </div>
  );
}
