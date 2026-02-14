import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ============================================
// User Types & RBAC
// ============================================

export type UserRole = 'buyer' | 'owner' | 'agent' | 'admin';

export type Permission =
  | 'property:create'
  | 'property:read'
  | 'property:update:own'
  | 'property:update:any'
  | 'property:delete:own'
  | 'property:delete:any'
  | 'user:manage'
  | 'analytics:view'
  | 'admin:access';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  buyer: ['property:read'],
  owner: [
    'property:create',
    'property:read',
    'property:update:own',
    'property:delete:own',
    'analytics:view',
  ],
  agent: [
    'property:create',
    'property:read',
    'property:update:own',
    'property:delete:own',
    'analytics:view',
  ],
  admin: [
    'property:create',
    'property:read',
    'property:update:any',
    'property:delete:any',
    'user:manage',
    'analytics:view',
    'admin:access',
  ],
};

export interface IUser {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): PublicUser;
}

export type PublicUser = Omit<IUser, 'password'> & { id: string };

// ============================================
// Auth Types
// ============================================

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

// ============================================
// Request Types
// ============================================

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// DTO Types
// ============================================

export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  fullName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// Project Types
// ============================================

export type ProjectStage = 'idea' | 'mvp' | 'beta' | 'live';
export type RiskLevel = 'low' | 'medium' | 'high';
export type PartnershipType = 'technical' | 'investment' | 'cofounder' | 'marketing' | 'other';

export interface IProject {
  name: string;
  industry: string;
  stage: ProjectStage;
  description: string;
  whatIsBuilt: string;
  whatIsMissing: string;
  partnershipType: PartnershipType;
  riskLevel: RiskLevel;
  readinessScore: number;
  owner: Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends IProject, Document {
  _id: Types.ObjectId;
  calculateReadinessScore(): number;
  toPublicJSON(): PublicProject;
}

export type PublicProject = Omit<IProject, 'owner'> & {
  id: string;
  owner: string | PublicUser;
};

// ============================================
// Project DTO Types
// ============================================

export interface CreateProjectDTO {
  name: string;
  industry: string;
  stage: ProjectStage;
  description: string;
  whatIsBuilt?: string;
  whatIsMissing?: string;
  partnershipType: PartnershipType;
  riskLevel?: RiskLevel;
}

export interface UpdateProjectDTO {
  name?: string;
  industry?: string;
  stage?: ProjectStage;
  description?: string;
  whatIsBuilt?: string;
  whatIsMissing?: string;
  partnershipType?: PartnershipType;
  riskLevel?: RiskLevel;
}

// ============================================
// Map Types (Architectural Drawings)
// ============================================

export type MapFileType = 'cad' | 'pdf' | 'image';
export type MapStatus = 'uploading' | 'processing' | 'ready' | 'error';

export interface IMap {
  project: Types.ObjectId;
  name: string;
  description?: string;
  fileType: MapFileType;
  originalFileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  status: MapStatus;
  processingError?: string;
  metadata: {
    width?: number;
    height?: number;
    pages?: number;
    layers?: string[];
  };
  version: number;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMapDocument extends IMap, Document {
  _id: Types.ObjectId;
  toPublicJSON(): PublicMap;
}

export type PublicMap = Omit<IMap, 'project' | 'uploadedBy' | 'storagePath'> & {
  id: string;
  project: string;
  uploadedBy: string | PublicUser;
  downloadUrl: string;
};

// ============================================
// Measurement Types
// ============================================

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
  | 'deg';

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface IMeasurement {
  map: Types.ObjectId;
  project: Types.ObjectId;
  name: string;
  type: MeasurementType;
  points: Point2D[] | Point3D[];
  value: number;
  unit: MeasurementUnit;
  displayValue: string;
  color?: string;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMeasurementDocument extends IMeasurement, Document {
  _id: Types.ObjectId;
  toPublicJSON(): PublicMeasurement;
}

export type PublicMeasurement = Omit<IMeasurement, 'map' | 'project' | 'createdBy'> & {
  id: string;
  map: string;
  project: string;
  createdBy: string | PublicUser;
};

// ============================================
// Cost Calculation Types
// ============================================

export type CostCategory = 'material' | 'labor' | 'equipment' | 'overhead' | 'other';

export interface CostItem {
  name: string;
  category: CostCategory;
  unitCost: number;
  unit: string;
  quantity: number;
  totalCost: number;
}

export interface ICostEstimate {
  project: Types.ObjectId;
  map?: Types.ObjectId;
  name: string;
  description?: string;
  measurements: Types.ObjectId[];
  items: CostItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICostEstimateDocument extends ICostEstimate, Document {
  _id: Types.ObjectId;
  recalculate(): void;
  toPublicJSON(): PublicCostEstimate;
}

export type PublicCostEstimate = Omit<
  ICostEstimate,
  'project' | 'map' | 'measurements' | 'createdBy'
> & {
  id: string;
  project: string;
  map?: string;
  measurements: string[];
  createdBy: string | PublicUser;
};

// ============================================
// Property Types
// ============================================

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

// Map property types to categories
export const PROPERTY_CATEGORY_MAP: Record<PropertyType, PropertyCategory> = {
  apartment: 'residential',
  villa: 'residential',
  office: 'commercial',
  land: 'commercial',
  building: 'commercial',
  warehouse: 'industrial',
  factory: 'industrial',
  industrial_land: 'industrial',
};

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

export interface IProperty {
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
  owner: Types.ObjectId;
  agent?: Types.ObjectId;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyDocument extends IProperty, Document {
  _id: Types.ObjectId;
  toPublicJSON(): PublicProperty;
}

export type PublicProperty = Omit<IProperty, 'owner' | 'agent'> & {
  id: string;
  owner: string | PublicUser;
  agent?: string | PublicUser;
};

// ============================================
// Property DTO Types
// ============================================

export interface CreatePropertyDTO {
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

export interface UpdatePropertyDTO {
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  price?: number;
  currency?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: PropertyLocation;
  images?: string[];
  features?: string[];
  featuresAr?: string[];
}

export interface PropertyQueryDTO {
  page?: number;
  limit?: number;
  q?: string;
  type?: PropertyType | PropertyType[];
  status?: PropertyStatus | PropertyStatus[];
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
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';
  featured?: boolean;
}
