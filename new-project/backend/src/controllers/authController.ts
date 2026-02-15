import { Response } from 'express';
import { authService } from '../services/index.js';
import {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../utils/validation.js';
import { AuthRequest, ApiResponse } from '../types/index.js';

// ============================================
// Auth Controller
// ============================================

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function register(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const data = validate(registerSchema, req.body);
  const result = await authService.register({
    ...data,
    role: data.role ?? 'buyer',
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result,
  });
}

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
export async function login(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const data = validate(loginSchema, req.body);
  const result = await authService.login(data);

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
}

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function refresh(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const { refreshToken } = validate(refreshTokenSchema, req.body);
  const tokens = await authService.refreshTokens(refreshToken);

  res.json({
    success: true,
    message: 'Tokens refreshed',
    data: tokens,
  });
}

/**
 * POST /api/auth/logout
 * Logout user (client should discard tokens)
 */
export async function logout(_req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  // In a production app, you might want to:
  // - Add the refresh token to a blacklist
  // - Store refresh tokens in DB and invalidate them
  // For now, just return success (client handles token removal)

  res.json({
    success: true,
    message: 'Logout successful',
  });
}

/**
 * GET /api/auth/me
 * Get current user's profile
 */
export async function getProfile(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const user = await authService.getProfile(req.user!.userId);

  res.json({
    success: true,
    message: 'Profile retrieved',
    data: user,
  });
}

/**
 * PATCH /api/auth/me
 * Update current user's profile
 */
export async function updateProfile(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const data = validate(updateProfileSchema, req.body);
  const user = await authService.updateProfile(req.user!.userId, data);

  res.json({
    success: true,
    message: 'Profile updated',
    data: user,
  });
}

/**
 * POST /api/auth/change-password
 * Change current user's password
 */
export async function changePassword(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const data = validate(changePasswordSchema, req.body);
  await authService.changePassword(req.user!.userId, data);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}

/**
 * DELETE /api/auth/me
 * Deactivate current user's account
 */
export async function deactivateAccount(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  await authService.deactivateUser(req.user!.userId);

  res.json({
    success: true,
    message: 'Account deactivated',
  });
}
