import { Request } from 'express';

// User Roles
export type UserRole = 'buyer' | 'owner' | 'agent' | 'admin';

// User Interface
export interface User {
  id: string;
  email: string;
  password: string; // Hashed
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

// Public User (without password)
export type PublicUser = Omit<User, 'password'>;

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Auth Request (with user)
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  messageAr?: string;
  data?: T;
  error?: string;
}

// Auth Responses
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

// Request DTOs
export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  fullNameAr?: string;
  phone?: string;
  role: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  fullNameAr?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Permission definitions
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
