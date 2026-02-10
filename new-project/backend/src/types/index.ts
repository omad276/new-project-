import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ============================================
// User Types
// ============================================

export type UserRole = 'user' | 'developer' | 'investor' | 'admin';

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
