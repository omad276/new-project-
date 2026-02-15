import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { JwtPayload, AuthTokens, UserRole } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenModel } from '../models/mockDb.js';

// Parse duration string to milliseconds
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

// Generate access token
export function generateAccessToken(userId: string, email: string, role: UserRole): string {
  const payload: JwtPayload = { userId, email, role };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

// Generate refresh token
export async function generateRefreshToken(userId: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + parseDuration(config.jwt.refreshExpiresIn));
  await RefreshTokenModel.save(token, userId, expiresAt);
  return token;
}

// Generate both tokens
export async function generateTokens(
  userId: string,
  email: string,
  role: UserRole
): Promise<AuthTokens> {
  const accessToken = generateAccessToken(userId, email, role);
  const refreshToken = await generateRefreshToken(userId);
  const expiresIn = parseDuration(config.jwt.expiresIn);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

// Verify access token
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Verify refresh token
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  const tokenData = await RefreshTokenModel.find(token);
  if (!tokenData) return null;
  return { userId: tokenData.userId };
}

// Revoke refresh token
export async function revokeRefreshToken(token: string): Promise<void> {
  await RefreshTokenModel.delete(token);
}

// Revoke all refresh tokens for a user
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await RefreshTokenModel.deleteAllForUser(userId);
}
