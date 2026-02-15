import { Response } from 'express';
import * as authService from '../services/authService.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  validate,
} from '../utils/validation.js';
import { AuthRequest, ApiResponse } from '../types/index.js';

// POST /api/auth/register
export async function register(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const validation = validate(registerSchema, req.body);
  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: validation.error,
    });
    return;
  }

  const result = await authService.register(validation.data);
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.error,
      messageAr: result.errorAr,
    });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    messageAr: 'تم التسجيل بنجاح',
    data: result.data,
  });
}

// POST /api/auth/login
export async function login(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const validation = validate(loginSchema, req.body);
  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: validation.error,
    });
    return;
  }

  const result = await authService.login(validation.data);
  if (!result.success) {
    res.status(401).json({
      success: false,
      message: result.error,
      messageAr: result.errorAr,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Login successful',
    messageAr: 'تم تسجيل الدخول بنجاح',
    data: result.data,
  });
}

// POST /api/auth/refresh
export async function refresh(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const validation = validate(refreshTokenSchema, req.body);
  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: validation.error,
    });
    return;
  }

  const result = await authService.refreshTokens(validation.data.refreshToken);
  if (!result.success) {
    res.status(401).json({
      success: false,
      message: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Tokens refreshed',
    messageAr: 'تم تحديث الرموز',
    data: result.data,
  });
}

// POST /api/auth/logout
export async function logout(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
    messageAr: 'تم تسجيل الخروج بنجاح',
  });
}

// POST /api/auth/logout-all
export async function logoutAll(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  await authService.logoutAll(req.user.userId);

  res.json({
    success: true,
    message: 'Logged out from all devices',
    messageAr: 'تم تسجيل الخروج من جميع الأجهزة',
  });
}

// GET /api/auth/me
export async function getProfile(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const result = await authService.getProfile(req.user.userId);
  if (!result.success) {
    res.status(404).json({
      success: false,
      message: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Profile retrieved',
    data: result.data,
  });
}

// PATCH /api/auth/me
export async function updateProfile(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const validation = validate(updateProfileSchema, req.body);
  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: validation.error,
    });
    return;
  }

  const result = await authService.updateProfile(req.user.userId, validation.data);
  if (!result.success) {
    res.status(404).json({
      success: false,
      message: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Profile updated',
    messageAr: 'تم تحديث الملف الشخصي',
    data: result.data,
  });
}

// POST /api/auth/change-password
export async function changePassword(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const validation = validate(changePasswordSchema, req.body);
  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: validation.error,
    });
    return;
  }

  const result = await authService.changePassword(req.user.userId, validation.data);
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.error,
      messageAr: result.errorAr,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Password changed successfully',
    messageAr: 'تم تغيير كلمة المرور بنجاح',
  });
}
