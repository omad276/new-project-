// User Types
export type UserRole = 'buyer' | 'owner' | 'agent' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  fullNameAr?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

// Role Permissions
export interface RolePermissions {
  canCreateProperty: boolean;
  canEditOwnProperty: boolean;
  canEditAnyProperty: boolean;
  canDeleteOwnProperty: boolean;
  canDeleteAnyProperty: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canAccessAdminPanel: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  buyer: {
    canCreateProperty: false,
    canEditOwnProperty: false,
    canEditAnyProperty: false,
    canDeleteOwnProperty: false,
    canDeleteAnyProperty: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canAccessAdminPanel: false,
  },
  owner: {
    canCreateProperty: true,
    canEditOwnProperty: true,
    canEditAnyProperty: false,
    canDeleteOwnProperty: true,
    canDeleteAnyProperty: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canAccessAdminPanel: false,
  },
  agent: {
    canCreateProperty: true,
    canEditOwnProperty: true,
    canEditAnyProperty: false,
    canDeleteOwnProperty: true,
    canDeleteAnyProperty: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canAccessAdminPanel: false,
  },
  admin: {
    canCreateProperty: true,
    canEditOwnProperty: true,
    canEditAnyProperty: true,
    canDeleteOwnProperty: true,
    canDeleteAnyProperty: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canAccessAdminPanel: true,
  },
};

// Property Types
export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'office'
  | 'land'
  | 'building'
  | 'warehouse'
  | 'factory'
  | 'industrial_land';

export type PropertyStatus =
  | 'for_sale'
  | 'for_rent'
  | 'off_plan'
  | 'investment'
  | 'sold'
  | 'rented';

export type PropertyCategory = 'residential' | 'commercial' | 'industrial';

export interface PropertyLocation {
  address: string;
  addressAr: string;
  city: string;
  cityAr: string;
  country: string;
  countryAr: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface Property {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: PropertyType;
  category: PropertyCategory;
  status: PropertyStatus;
  price: number;
  currency: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: PropertyLocation;
  images: string[];
  features: string[];
  featuresAr: string[];
  owner: string | User;
  agent?: string | User;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Filter Types
export interface PropertyFilters {
  type?: PropertyType[];
  status?: PropertyStatus[];
  category?: PropertyCategory;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  lng?: number;
  lat?: number;
  radius?: number;
  featured?: boolean;
  // Advanced filters
  minPricePerSqm?: number;
  maxPricePerSqm?: number;
  minRentalYield?: number;
  maxRentalYield?: number;
  polygon?: number[][]; // Array of [lng, lat] coordinates for map search
}

export interface PropertyQueryParams extends PropertyFilters {
  page?: number;
  limit?: number;
  q?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Map Types
export type MapFileType = 'cad' | 'pdf' | 'image';
export type MapStatus = 'uploading' | 'processing' | 'ready' | 'error';
export type ScaleUnit = 'm' | 'cm' | 'mm' | 'ft' | 'in';

export interface MapScale {
  pixelDistance: number;
  realDistance: number;
  unit: ScaleUnit;
  ratio: number;
}

export interface BlueprintMap {
  id: string;
  name: string;
  description?: string;
  fileType: MapFileType;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  status: MapStatus;
  processingError?: string;
  metadata?: {
    width?: number;
    height?: number;
    pages?: number;
    layers?: string[];
  };
  scale?: MapScale;
  isCalibrated?: boolean;
  version: number;
  project: string;
  uploadedBy: string;
  downloadUrl: string;
  createdAt: Date;
  updatedAt: Date;
  // Extended fields for UI (populated separately)
  projectName?: string;
  projectNameAr?: string;
}

// Measurement Types
export interface Point {
  x: number;
  y: number;
  z?: number;
}

export type MeasurementType = 'area' | 'distance' | 'volume' | 'perimeter' | 'angle';
export type MeasurementUnit =
  | 'm'
  | 'cm'
  | 'mm'
  | 'ft'
  | 'in'
  | 'sqm'
  | 'sqft'
  | 'cbm'
  | 'cbft'
  | 'deg'
  | 'px';

export interface Measurement {
  id: string;
  mapId: string;
  type: 'distance' | 'area' | 'angle';
  points: Point[];
  value: number;
  unit: string;
  color: string;
  name: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Payload for creating measurements (matches what BlueprintViewer emits)
export type CreateMeasurementPayload = Omit<
  Measurement,
  'id' | 'mapId' | 'createdAt' | 'updatedAt'
>;
