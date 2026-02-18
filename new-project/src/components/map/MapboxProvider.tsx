import { createContext, useContext, ReactNode } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxContextValue {
  accessToken: string;
  isReady: boolean;
}

const MapboxContext = createContext<MapboxContextValue>({
  accessToken: '',
  isReady: false,
});

interface MapboxProviderProps {
  children: ReactNode;
}

export function MapboxProvider({ children }: MapboxProviderProps) {
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

  return (
    <MapboxContext.Provider value={{ accessToken, isReady: !!accessToken }}>
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
