import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AuthRequest, UserRole, ROLE_PERMISSIONS, ApiResponse } from '../types/index.js';

// Authenticate user (required)
export function authenticate(
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      messageAr: 'يجب تسجيل الدخول',
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      messageAr: 'رمز غير صالح أو منتهي الصلاحية',
    });
    return;
  }

  req.user = payload;
  next();
}

// Authenticate user (optional - doesn't fail if not authenticated)
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}

// Authorize by role (requires authentication first)
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        messageAr: 'يجب تسجيل الدخول',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        messageAr: 'صلاحيات غير كافية',
      });
      return;
    }

    next();
  };
}

// Check specific permission
export function requirePermission(permission: keyof typeof ROLE_PERMISSIONS.admin) {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        messageAr: 'يجب تسجيل الدخول',
      });
      return;
    }

    const rolePermissions = ROLE_PERMISSIONS[req.user.role];
    if (!rolePermissions[permission]) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        messageAr: 'صلاحيات غير كافية',
      });
      return;
    }

    next();
  };
}

// Admin only shortcut
export const adminOnly = authorize('admin');

// Owners and above (owner, agent, admin)
export const ownerOrAbove = authorize('owner', 'agent', 'admin');

// Agents and above (agent, admin)
export const agentOrAbove = authorize('agent', 'admin');
