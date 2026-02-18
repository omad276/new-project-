import { useState } from 'react';
import { Map, Layers, Moon, Sun, Mountain } from 'lucide-react';
import type { MapStyle } from './PropertiesMap';

interface MapStyleControlProps {
  value: MapStyle;
  onChange: (style: MapStyle) => void;
  className?: string;
}

const STYLE_OPTIONS: { value: MapStyle; icon: typeof Map; label: string }[] = [
  { value: 'streets', icon: Map, label: 'Streets' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'satellite-streets', icon: Layers, label: 'Satellite' },
  { value: 'outdoors', icon: Mountain, label: 'Outdoors' },
];

export function MapStyleControl({ value, onChange, className = '' }: MapStyleControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`absolute bottom-4 left-4 z-10 ${className}`}>
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-1">
          {STYLE_OPTIONS.map(({ value: style, icon: Icon, label }) => (
            <button
              key={style}
              onClick={() => {
                onChange(style);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                ${value === style ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title="Map Style"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>
      )}
    </div>
  );
}

export type { MapStyleControlProps };
