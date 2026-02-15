import bcrypt from 'bcryptjs';
import { UserModel } from '../models/mockDb.js';
import {
  generateTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../utils/jwt.js';
import {
  User,
  PublicUser,
  RegisterDto,
  LoginDto,
  LoginResponse,
  RegisterResponse,
  AuthTokens,
  UpdateProfileDto,
  ChangePasswordDto,
} from '../types/index.js';

// Remove password from user object
function sanitizeUser(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

// Register new user
export async function register(
  data: RegisterDto
): Promise<
  { success: true; data: RegisterResponse } | { success: false; error: string; errorAr?: string }
> {
  // Check if email already exists
  const existingUser = await UserModel.findByEmail(data.email);
  if (existingUser) {
    return {
      success: false,
      error: 'Email already registered',
      errorAr: 'البريد الإلكتروني مسجل مسبقاً',
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Create user
  const user = await UserModel.create({
    email: data.email.toLowerCase(),
    password: hashedPassword,
    fullName: data.fullName,
    fullNameAr: data.fullNameAr,
    phone: data.phone,
    role: data.role,
    isActive: true,
    isVerified: false, // Require email verification in production
  });

  // Generate tokens
  const tokens = await generateTokens(user.id, user.email, user.role);

  return {
    success: true,
    data: {
      user: sanitizeUser(user),
      tokens,
    },
  };
}

// Login user
export async function login(
  data: LoginDto
): Promise<
  { success: true; data: LoginResponse } | { success: false; error: string; errorAr?: string }
> {
  // Find user
  const user = await UserModel.findByEmail(data.email);
  if (!user) {
    return {
      success: false,
      error: 'Invalid email or password',
      errorAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    };
  }

  // Check if user is active
  if (!user.isActive) {
    return {
      success: false,
      error: 'Account is deactivated',
      errorAr: 'الحساب معطل',
    };
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(data.password, user.password);
  if (!isValidPassword) {
    return {
      success: false,
      error: 'Invalid email or password',
      errorAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    };
  }

  // Generate tokens
  const tokens = await generateTokens(user.id, user.email, user.role);

  return {
    success: true,
    data: {
      user: sanitizeUser(user),
      tokens,
    },
  };
}

// Refresh tokens
export async function refreshTokens(
  refreshToken: string
): Promise<{ success: true; data: AuthTokens } | { success: false; error: string }> {
  // Verify refresh token
  const tokenData = await verifyRefreshToken(refreshToken);
  if (!tokenData) {
    return { success: false, error: 'Invalid or expired refresh token' };
  }

  // Find user
  const user = await UserModel.findById(tokenData.userId);
  if (!user || !user.isActive) {
    return { success: false, error: 'User not found or inactive' };
  }

  // Revoke old refresh token
  await revokeRefreshToken(refreshToken);

  // Generate new tokens
  const tokens = await generateTokens(user.id, user.email, user.role);

  return { success: true, data: tokens };
}

// Logout (revoke refresh token)
export async function logout(refreshToken: string): Promise<void> {
  await revokeRefreshToken(refreshToken);
}

// Logout from all devices
export async function logoutAll(userId: string): Promise<void> {
  await revokeAllUserTokens(userId);
}

// Get user profile
export async function getProfile(
  userId: string
): Promise<{ success: true; data: PublicUser } | { success: false; error: string }> {
  const user = await UserModel.findById(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  return { success: true, data: sanitizeUser(user) };
}

// Update user profile
export async function updateProfile(
  userId: string,
  data: UpdateProfileDto
): Promise<{ success: true; data: PublicUser } | { success: false; error: string }> {
  const user = await UserModel.update(userId, data);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  return { success: true, data: sanitizeUser(user) };
}

// Change password
export async function changePassword(
  userId: string,
  data: ChangePasswordDto
): Promise<{ success: true } | { success: false; error: string; errorAr?: string }> {
  const user = await UserModel.findById(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
  if (!isValidPassword) {
    return {
      success: false,
      error: 'Current password is incorrect',
      errorAr: 'كلمة المرور الحالية غير صحيحة',
    };
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 12);

  // Update password
  await UserModel.update(userId, { password: hashedPassword });

  // Revoke all refresh tokens (logout from all devices)
  await revokeAllUserTokens(userId);

  return { success: true };
}
