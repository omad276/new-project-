import { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from './GoogleMapsProvider';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  address: string;
  title: string;
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
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

export function PropertyMap({ lat, lng, address, title, className = '' }: PropertyMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [showInfo, setShowInfo] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const center = { lat, lng };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    // Fallback to static map link when Google Maps fails to load
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    return (
      <div className={`flex items-center justify-center bg-background-tertiary rounded-lg ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-primary" />
          <p className="text-text-secondary mb-2">{address}</p>
          <p className="text-sm text-text-muted mb-4">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Open in Google Maps
          </a>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-background-tertiary rounded-lg animate-pulse ${className}`}>
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
        center={center}
        zoom={15}
        options={defaultOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <Marker
          position={center}
          onClick={() => setShowInfo(true)}
          animation={google.maps.Animation.DROP}
        />

        {showInfo && (
          <InfoWindow position={center} onCloseClick={() => setShowInfo(false)}>
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{address}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
