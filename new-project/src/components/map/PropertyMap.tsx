import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { useMapbox } from './MapboxProvider';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  address: string;
  title: string;
  className?: string;
}

export function PropertyMap({ lat, lng, address, title, className = '' }: PropertyMapProps) {
  const { accessToken, isReady } = useMapbox();
  const [showInfo, setShowInfo] = useState(false);

  if (!isReady) {
    // Fallback when Mapbox token is not configured
    const mapsUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
    return (
      <div
        className={`flex items-center justify-center bg-background-tertiary rounded-lg ${className}`}
      >
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
            Open in Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <Map
        mapboxAccessToken={accessToken}
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: 15,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <Marker
          longitude={lng}
          latitude={lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setShowInfo(true);
          }}
        >
          <div className="cursor-pointer animate-bounce-once">
            <svg width="40" height="50" viewBox="0 0 40 50">
              <path
                d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z"
                fill="#C5A572"
              />
              <circle cx="20" cy="18" r="8" fill="white" />
            </svg>
          </div>
        </Marker>

        {showInfo && (
          <Popup
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClose={() => setShowInfo(false)}
            closeButton={true}
            closeOnClick={false}
            offset={[0, -50]}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{address}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
