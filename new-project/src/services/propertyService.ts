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
// Helper to transform API property to frontend Property
// ============================================

interface ApiProperty {
  _id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  type: string;
  status: string;
  price: number;
  currency: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: {
    address?: string;
    addressAr?: string;
    city?: string;
    cityAr?: string;
    country?: string;
    countryAr?: string;
    coordinates?: {
      type: string;
      coordinates: [number, number];
    };
  };
  images: string[];
  features?: string[];
  featuresAr?: string[];
  owner?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

function transformProperty(apiProp: ApiProperty): Property {
  return {
    id: apiProp._id,
    title: apiProp.title,
    titleAr: apiProp.titleAr,
    description: apiProp.description,
    descriptionAr: apiProp.descriptionAr,
    type: apiProp.type as PropertyType,
    status: apiProp.status as PropertyStatus,
    price: apiProp.price,
    currency: apiProp.currency,
    area: apiProp.area,
    bedrooms: apiProp.bedrooms,
    bathrooms: apiProp.bathrooms,
    location: {
      address: apiProp.location.address || '',
      addressAr: apiProp.location.addressAr || '',
      city: apiProp.location.city || '',
      cityAr: apiProp.location.cityAr || '',
      country: apiProp.location.country || '',
      countryAr: apiProp.location.countryAr || '',
      latitude: apiProp.location.coordinates?.coordinates[1] || 0,
      longitude: apiProp.location.coordinates?.coordinates[0] || 0,
    },
    images: apiProp.images.map((img) =>
      img.startsWith('http') ? img : `http://localhost:3002/${img}`
    ),
    features: apiProp.features || [],
    ownerId: apiProp.owner || '',
    createdAt: new Date(apiProp.createdAt),
    updatedAt: new Date(apiProp.updatedAt),
  };
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

    const response = await api.get<ApiProperty[]>(url);

    return {
      ...response,
      data: response.data ? response.data.map(transformProperty) : [],
    } as PaginatedResponse<Property>;
  },

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit: number = 6): Promise<ApiResponse<Property[]>> {
    const response = await api.get<ApiProperty[]>(`/properties/featured?limit=${limit}`);
    return {
      ...response,
      data: response.data ? response.data.map(transformProperty) : undefined,
    };
  },

  /**
   * Get single property by ID
   */
  async getProperty(id: string): Promise<ApiResponse<Property>> {
    const response = await api.get<ApiProperty>(`/properties/${id}`);
    return {
      ...response,
      data: response.data ? transformProperty(response.data) : undefined,
    };
  },

  /**
   * Get current user's properties
   */
  async getMyProperties(includeInactive: boolean = false): Promise<ApiResponse<Property[]>> {
    const url = includeInactive ? '/properties/my?includeInactive=true' : '/properties/my';
    const response = await api.get<ApiProperty[]>(url);
    return {
      ...response,
      data: response.data ? response.data.map(transformProperty) : undefined,
    };
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
