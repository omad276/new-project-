import { useState, useCallback } from 'react';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  position: GeolocationPosition | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * Hook for getting the user's geolocation
 *
 * @example
 * const { position, error, loading, locate } = useGeolocation();
 *
 * // Call locate() to get current position
 * <button onClick={locate}>Find My Location</button>
 *
 * // Use position when available
 * if (position) {
 *   console.log(position.latitude, position.longitude);
 * }
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
  });

  const mergedOptions = { ...defaultOptions, ...options };

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        position: null,
        error: 'Geolocation is not supported by this browser',
        loading: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      (err) => {
        let errorMessage = 'Failed to get location';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState({
          position: null,
          error: errorMessage,
          loading: false,
        });
      },
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        timeout: mergedOptions.timeout,
        maximumAge: mergedOptions.maximumAge,
      }
    );
  }, [mergedOptions.enableHighAccuracy, mergedOptions.timeout, mergedOptions.maximumAge]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    position: state.position,
    error: state.error,
    loading: state.loading,
    locate,
    clearError,
  };
}

export type { GeolocationPosition, GeolocationState, UseGeolocationOptions };
