import { useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  address: string;
  title: string;
  className?: string;
}

export function PropertyMap({ lat, lng, address, title, className = '' }: PropertyMapProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: 15,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        <NavigationControl position="top-right" />
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
