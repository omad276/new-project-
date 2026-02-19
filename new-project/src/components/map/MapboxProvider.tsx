import { createContext, useContext, ReactNode } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapboxContextValue {
  accessToken: string;
  isReady: boolean;
}

const MapboxContext = createContext<MapboxContextValue>({
  accessToken: '',
  isReady: true, // Always ready with MapLibre (no token needed)
});

interface MapboxProviderProps {
  children: ReactNode;
}

export function MapboxProvider({ children }: MapboxProviderProps) {
  // MapLibre doesn't need an access token - using free OpenStreetMap tiles
  return (
    <MapboxContext.Provider value={{ accessToken: '', isReady: true }}>
      {children}
    </MapboxContext.Provider>
  );
}

export function useMapbox() {
  const context = useContext(MapboxContext);
  if (context === undefined) {
    throw new Error('useMapbox must be used within a MapboxProvider');
  }
  return context;
}
