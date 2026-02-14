import { useState, useEffect, useCallback } from 'react';
import { propertyService, PropertyStats } from '@/services/propertyService';
import type { Property, PropertyFilters, PropertyQueryParams } from '@/types';

// ============================================
// useProperties Hook
// ============================================

interface UsePropertiesReturn {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  params: PropertyQueryParams;
  updateFilters: (newFilters: PropertyFilters) => void;
  setPage: (page: number) => void;
  setSort: (sort: PropertyQueryParams['sort']) => void;
  search: (q: string) => void;
  refresh: () => void;
}

export function useProperties(initialParams: PropertyQueryParams = {}): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<PropertyQueryParams>(initialParams);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await propertyService.getProperties(params);
      if (response.success && response.data) {
        setProperties(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'Failed to fetch properties');
      }
    } catch (err) {
      setError('An error occurred while fetching properties');
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const updateFilters = useCallback((newFilters: PropertyFilters) => {
    setParams((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setSort = useCallback((sort: PropertyQueryParams['sort']) => {
    setParams((prev) => ({ ...prev, sort, page: 1 }));
  }, []);

  const search = useCallback((q: string) => {
    setParams((prev) => ({ ...prev, q: q || undefined, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    pagination,
    isLoading,
    error,
    params,
    updateFilters,
    setPage,
    setSort,
    search,
    refresh,
  };
}

// ============================================
// useProperty Hook (Single Property)
// ============================================

interface UsePropertyReturn {
  property: Property | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useProperty(id: string | undefined): UsePropertyReturn {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await propertyService.getProperty(id);
      if (response.success && response.data) {
        setProperty(response.data);
      } else {
        setError(response.message || 'Property not found');
      }
    } catch (err) {
      setError('An error occurred while fetching property');
      console.error('Error fetching property:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return { property, isLoading, error, refresh: fetchProperty };
}

// ============================================
// useMyProperties Hook
// ============================================

interface UseMyPropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  deleteProperty: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: Property['status']) => Promise<boolean>;
}

export function useMyProperties(includeInactive: boolean = true): UseMyPropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await propertyService.getMyProperties(includeInactive);
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        setError(response.message || 'Failed to fetch your properties');
      }
    } catch (err) {
      setError('An error occurred while fetching your properties');
      console.error('Error fetching my properties:', err);
    } finally {
      setIsLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchMyProperties();
  }, [fetchMyProperties]);

  const deleteProperty = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await propertyService.deleteProperty(id);
      if (response.success) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting property:', err);
      return false;
    }
  }, []);

  const updateStatus = useCallback(
    async (id: string, status: Property['status']): Promise<boolean> => {
      try {
        const response = await propertyService.updatePropertyStatus(id, status);
        if (response.success && response.data) {
          setProperties((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: response.data!.status } : p))
          );
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error updating property status:', err);
        return false;
      }
    },
    []
  );

  return {
    properties,
    isLoading,
    error,
    refresh: fetchMyProperties,
    deleteProperty,
    updateStatus,
  };
}

// ============================================
// usePropertyStats Hook
// ============================================

interface UsePropertyStatsReturn {
  stats: PropertyStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePropertyStats(): UsePropertyStatsReturn {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await propertyService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError('An error occurred while fetching statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refresh: fetchStats };
}

// ============================================
// useFeaturedProperties Hook
// ============================================

export function useFeaturedProperties(limit: number = 6) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await propertyService.getFeaturedProperties(limit);
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        setError(response.message || 'Failed to fetch featured properties');
      }
    } catch (err) {
      setError('An error occurred while fetching featured properties');
      console.error('Error fetching featured properties:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return { properties, isLoading, error, refresh: fetchFeatured };
}
