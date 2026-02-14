import { z } from 'zod';
import { AppError } from './AppError.js';

// ============================================
// Validation Schemas
// ============================================

// User role enum
export const userRoleSchema = z.enum(['buyer', 'owner', 'agent', 'admin']);

// Email validation
const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(255, 'Email too long')
  .transform((v) => v.toLowerCase().trim());

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number');

// Phone validation (optional, international format)
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format')
  .optional();

// Full name validation
const fullNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .trim();

// ============================================
// Request Validation Schemas
// ============================================

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  phone: phoneSchema,
  role: userRoleSchema.default('buyer'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
  fullName: fullNameSchema.optional(),
  phone: phoneSchema,
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

// ============================================
// Validation Helper
// ============================================

/**
 * Validate data against a Zod schema
 * Throws AppError on validation failure
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Format Zod errors into a clean structure
    const errors: Record<string, string[]> = {};

    for (const error of result.error.errors) {
      const path = error.path.join('.') || 'value';
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(error.message);
    }

    throw AppError.badRequest('Validation failed', errors);
  }

  return result.data;
}

// ============================================
// Type Exports
// ============================================

export type RegisterInput = z.output<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================
// Project Validation Schemas
// ============================================

export const projectStageSchema = z.enum(['idea', 'mvp', 'beta', 'live']);
export const riskLevelSchema = z.enum(['low', 'medium', 'high']);
export const partnershipTypeSchema = z.enum([
  'technical',
  'investment',
  'cofounder',
  'marketing',
  'other',
]);

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long').trim(),
  industry: z.string().min(2, 'Industry is required').max(50, 'Industry too long').trim(),
  stage: projectStageSchema.default('idea'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description too long')
    .trim(),
  whatIsBuilt: z.string().max(1000, 'Too long').trim().optional(),
  whatIsMissing: z.string().max(1000, 'Too long').trim().optional(),
  partnershipType: partnershipTypeSchema,
  riskLevel: riskLevelSchema.default('medium'),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name too long')
    .trim()
    .optional(),
  industry: z
    .string()
    .min(2, 'Industry is required')
    .max(50, 'Industry too long')
    .trim()
    .optional(),
  stage: projectStageSchema.optional(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description too long')
    .trim()
    .optional(),
  whatIsBuilt: z.string().max(1000, 'Too long').trim().optional(),
  whatIsMissing: z.string().max(1000, 'Too long').trim().optional(),
  partnershipType: partnershipTypeSchema.optional(),
  riskLevel: riskLevelSchema.optional(),
});

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  industry: z.string().optional(),
  stage: projectStageSchema.optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
});

export type CreateProjectInput = z.output<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.output<typeof projectQuerySchema>;

// ============================================
// Property Validation Schemas
// ============================================

export const propertyTypeSchema = z.enum([
  'apartment',
  'villa',
  'office',
  'land',
  'building',
  'warehouse',
  'factory',
  'industrial_land',
]);

export const propertyStatusSchema = z.enum([
  'for_sale',
  'for_rent',
  'off_plan',
  'investment',
  'sold',
  'rented',
]);

export const propertyCategorySchema = z.enum(['residential', 'commercial', 'industrial']);

const coordinatesSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90), // latitude
  ]),
});

const locationSchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters').max(500).trim(),
  addressAr: z.string().min(5, 'Arabic address must be at least 5 characters').max(500).trim(),
  city: z.string().min(2, 'City is required').max(100).trim(),
  cityAr: z.string().min(2, 'Arabic city name is required').max(100).trim(),
  country: z.string().default('Saudi Arabia'),
  countryAr: z.string().default('المملكة العربية السعودية'),
  coordinates: coordinatesSchema,
});

export const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200).trim(),
  titleAr: z.string().min(5, 'Arabic title must be at least 5 characters').max(200).trim(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000).trim(),
  descriptionAr: z
    .string()
    .min(20, 'Arabic description must be at least 20 characters')
    .max(5000)
    .trim(),
  type: propertyTypeSchema,
  status: propertyStatusSchema,
  price: z.number().positive('Price must be positive'),
  currency: z.enum(['SAR', 'USD', 'EUR', 'AED']).default('SAR'),
  area: z.number().positive('Area must be positive'),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  location: locationSchema,
  images: z.array(z.string().url('Invalid image URL')).max(20).default([]),
  features: z.array(z.string().trim().max(100)).max(30).default([]),
  featuresAr: z.array(z.string().trim().max(100)).max(30).default([]),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  q: z.string().optional(), // text search
  type: z
    .union([propertyTypeSchema, z.array(propertyTypeSchema)])
    .optional()
    .transform((v) => (v ? (Array.isArray(v) ? v : [v]) : undefined)),
  status: z
    .union([propertyStatusSchema, z.array(propertyStatusSchema)])
    .optional()
    .transform((v) => (v ? (Array.isArray(v) ? v : [v]) : undefined)),
  category: propertyCategorySchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minArea: z.coerce.number().min(0).optional(),
  maxArea: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  city: z.string().optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  radius: z.coerce.number().min(1).max(100).default(10).optional(), // km
  sort: z
    .enum(['newest', 'oldest', 'price_asc', 'price_desc', 'area_asc', 'area_desc'])
    .default('newest'),
  featured: z.coerce.boolean().optional(),
});

export type CreatePropertyInput = z.output<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyQueryInput = z.output<typeof propertyQuerySchema>;
