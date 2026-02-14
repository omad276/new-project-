import { api } from '@/lib/api';
import type {
  Property,
  PropertyQueryParams,
  ApiResponse,
  PaginatedResponse,
  PropertyLocation,
  PropertyType,
  PropertyStatus,
} from '@/types';

// ============================================
// Property Service Types
// ============================================

export interface CreatePropertyData {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency?: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: PropertyLocation;
  images?: string[];
  features?: string[];
  featuresAr?: string[];
}

export interface PropertyStats {
  totalProperties: number;
  activeListings: number;
  soldProperties: number;
  rentedProperties: number;
  totalViews: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

// ============================================
// Property Service
// ============================================

export const propertyService = {
  /**
   * Get properties with filters and pagination
   */
  async getProperties(params: PropertyQueryParams = {}): Promise<PaginatedResponse<Property>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/properties?${queryString}` : '/properties';

    return api.get<Property[]>(url) as Promise<PaginatedResponse<Property>>;
  },

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit: number = 6): Promise<ApiResponse<Property[]>> {
    return api.get<Property[]>(`/properties/featured?limit=${limit}`);
  },

  /**
   * Get single property by ID
   */
  async getProperty(id: string): Promise<ApiResponse<Property>> {
    return api.get<Property>(`/properties/${id}`);
  },

  /**
   * Get current user's properties
   */
  async getMyProperties(includeInactive: boolean = false): Promise<ApiResponse<Property[]>> {
    const url = includeInactive ? '/properties/my?includeInactive=true' : '/properties/my';
    return api.get<Property[]>(url);
  },

  /**
   * Get property statistics
   */
  async getStats(): Promise<ApiResponse<PropertyStats>> {
    return api.get<PropertyStats>('/properties/stats');
  },

  /**
   * Get nearby properties
   */
  async getNearbyProperties(
    lng: number,
    lat: number,
    radius: number = 10,
    limit: number = 20
  ): Promise<ApiResponse<Property[]>> {
    return api.get<Property[]>(
      `/properties/nearby?lng=${lng}&lat=${lat}&radius=${radius}&limit=${limit}`
    );
  },

  /**
   * Create a new property
   */
  async createProperty(data: CreatePropertyData): Promise<ApiResponse<Property>> {
    return api.post<Property>('/properties', data);
  },

  /**
   * Update a property
   */
  async updateProperty(
    id: string,
    data: Partial<CreatePropertyData>
  ): Promise<ApiResponse<Property>> {
    return api.patch<Property>(`/properties/${id}`, data);
  },

  /**
   * Update property status
   */
  async updatePropertyStatus(id: string, status: PropertyStatus): Promise<ApiResponse<Property>> {
    return api.patch<Property>(`/properties/${id}/status`, { status });
  },

  /**
   * Delete a property
   */
  async deleteProperty(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/properties/${id}`);
  },

  /**
   * Toggle featured status (admin only)
   */
  async toggleFeatured(id: string): Promise<ApiResponse<Property>> {
    return api.post<Property>(`/properties/${id}/feature`);
  },
};

export default propertyService;
