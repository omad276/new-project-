import api from '@/lib/api';

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'buyer' | 'owner' | 'agent' | 'admin';
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  active: number;
  verified: number;
  byRole: Record<string, number>;
  newThisMonth: number;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data: UserStats;
}

export interface UpdateUserData {
  role?: 'buyer' | 'owner' | 'agent' | 'admin';
  isActive?: boolean;
  isVerified?: boolean;
  fullName?: string;
  phone?: string;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  q?: string;
}

// Property Admin Types
export interface PropertyStats {
  totalProperties: number;
  forSale: number;
  forRent: number;
  featured: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byCity: Record<string, number>;
}

// API Functions
export async function getUsers(params: UsersQueryParams = {}): Promise<UsersResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.role) searchParams.set('role', params.role);
  if (params.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
  if (params.isVerified !== undefined) searchParams.set('isVerified', params.isVerified.toString());
  if (params.q) searchParams.set('q', params.q);

  const queryString = searchParams.toString();
  const url = queryString ? `/users?${queryString}` : '/users';

  const response = await api.get<UsersResponse>(url);
  return response.data!;
}

export async function getUserStats(): Promise<UserStatsResponse> {
  const response = await api.get<UserStatsResponse>('/users/stats');
  return response.data!;
}

export async function getUser(id: string): Promise<{ success: boolean; data: User }> {
  const response = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
  return response.data!;
}

export async function updateUser(
  id: string,
  data: UpdateUserData
): Promise<{ success: boolean; data: User }> {
  const response = await api.patch<{ success: boolean; data: User }>(`/users/${id}`, data);
  return response.data!;
}

export async function deactivateUser(id: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
  return response.data!;
}

export async function getPropertyStats(): Promise<{ success: boolean; data: PropertyStats }> {
  const response = await api.get<{ success: boolean; data: PropertyStats }>('/properties/stats');
  return response.data!;
}
