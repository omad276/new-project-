import { api } from '@/lib/api';
import type {
  Property,
  PropertyQueryParams,
  ApiResponse,
  PaginatedResponse,
  PropertyType,
  PropertyStatus,
  PropertyCategory,
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
  category: PropertyCategory;
  status: PropertyStatus;
  price: number;
  currency?: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: {
    address: string;
    addressAr: string;
    city: string;
    cityAr: string;
    country?: string;
    countryAr?: string;
    coordinates?: {
      type: string;
      coordinates: [number, number];
    };
  };
  images?: string[];
  features?: string[];
  featuresAr?: string[];
  isFeatured?: boolean;
}

export interface PropertyStats {
  totalProperties: number;
  forSale: number;
  forRent: number;
  featured: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byCity: Record<string, number>;
}

// ============================================
// API Property type (what backend returns)
// ============================================

interface ApiProperty {
  _id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: string;
  category: string;
  status: string;
  price: number;
  currency: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: {
    address: string;
    addressAr: string;
    city: string;
    cityAr: string;
    country: string;
    countryAr: string;
    coordinates?: {
      type: string;
      coordinates: [number, number];
    };
  };
  images: string[];
  features: string[];
  featuresAr: string[];
  owner: string | { _id: string; fullName: string; fullNameAr?: string; avatar?: string };
  agent?: string | { _id: string; fullName: string; fullNameAr?: string; avatar?: string };
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Transform API property to frontend Property
// ============================================

function transformProperty(apiProp: ApiProperty): Property {
  return {
    id: apiProp._id,
    title: apiProp.title,
    titleAr: apiProp.titleAr,
    description: apiProp.description,
    descriptionAr: apiProp.descriptionAr,
    type: apiProp.type as PropertyType,
    category: apiProp.category as PropertyCategory,
    status: apiProp.status as PropertyStatus,
    price: apiProp.price,
    currency: apiProp.currency,
    area: apiProp.area,
    bedrooms: apiProp.bedrooms,
    bathrooms: apiProp.bathrooms,
    location: {
      address: apiProp.location.address,
      addressAr: apiProp.location.addressAr,
      city: apiProp.location.city,
      cityAr: apiProp.location.cityAr,
      country: apiProp.location.country,
      countryAr: apiProp.location.countryAr,
      coordinates: apiProp.location.coordinates
        ? { type: 'Point' as const, coordinates: apiProp.location.coordinates.coordinates }
        : { type: 'Point' as const, coordinates: [0, 0] as [number, number] },
    },
    images: apiProp.images,
    features: apiProp.features || [],
    featuresAr: apiProp.featuresAr || [],
    owner: typeof apiProp.owner === 'string' ? apiProp.owner : apiProp.owner._id,
    agent: apiProp.agent
      ? typeof apiProp.agent === 'string'
        ? apiProp.agent
        : apiProp.agent._id
      : undefined,
    isActive: apiProp.isActive,
    isFeatured: apiProp.isFeatured,
    viewCount: apiProp.viewCount,
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
      data: (response.data || []).map(transformProperty),
    };
  },

  /**
   * Get single property by ID
   */
  async getProperty(id: string): Promise<ApiResponse<Property>> {
    const response = await api.get<ApiProperty>(`/properties/${id}`);
    return {
      ...response,
      data: transformProperty(response.data!),
    };
  },

  /**
   * Get current user's properties
   */
  async getMyProperties(): Promise<ApiResponse<Property[]>> {
    const response = await api.get<ApiProperty[]>('/properties/my');
    return {
      ...response,
      data: (response.data || []).map(transformProperty),
    };
  },

  /**
   * Get property statistics
   */
  async getStats(): Promise<ApiResponse<PropertyStats>> {
    const response = await api.get<PropertyStats>('/properties/stats');
    return {
      ...response,
      data: response.data!,
    };
  },

  /**
   * Create a new property
   */
  async createProperty(data: CreatePropertyData): Promise<ApiResponse<Property>> {
    const response = await api.post<ApiProperty>('/properties', data);
    return {
      ...response,
      data: transformProperty(response.data!),
    };
  },

  /**
   * Update a property
   */
  async updateProperty(
    id: string,
    data: Partial<CreatePropertyData>
  ): Promise<ApiResponse<Property>> {
    const response = await api.patch<ApiProperty>(`/properties/${id}`, data);
    return {
      ...response,
      data: transformProperty(response.data!),
    };
  },

  /**
   * Delete a property
   */
  async deleteProperty(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/properties/${id}`);
    return {
      ...response,
      data: undefined as unknown as void,
    };
  },
};

export default propertyService;
