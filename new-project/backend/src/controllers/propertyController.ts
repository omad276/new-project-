import { Response } from 'express';
import * as propertyService from '../services/propertyService.js';
import {
  validate,
  createPropertySchema,
  updatePropertySchema,
  propertyQuerySchema,
} from '../utils/validation.js';
import { AuthRequest, ApiResponse, ROLE_PERMISSIONS } from '../types/index.js';

// ============================================
// Property Controller
// ============================================

/**
 * POST /api/properties
 * Create a new property
 */
export async function createProperty(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const data = validate(createPropertySchema, req.body);
  const property = await propertyService.createProperty(req.user!.userId, data);

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: property,
  });
}

/**
 * GET /api/properties
 * Search and filter properties with pagination
 */
export async function getProperties(req: AuthRequest, res: Response): Promise<void> {
  const query = validate(propertyQuerySchema, req.query);
  const result = await propertyService.searchProperties(query);

  res.json({
    success: true,
    message: 'Properties retrieved',
    data: result.properties,
    pagination: result.pagination,
  });
}

/**
 * GET /api/properties/featured
 * Get featured properties
 */
export async function getFeaturedProperties(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
  const properties = await propertyService.getFeaturedProperties(limit);

  res.json({
    success: true,
    message: 'Featured properties retrieved',
    data: properties,
  });
}

/**
 * GET /api/properties/my
 * Get current user's properties
 */
export async function getMyProperties(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const includeInactive = req.query.includeInactive === 'true';
  const properties = await propertyService.getPropertiesByOwner(req.user!.userId, includeInactive);

  res.json({
    success: true,
    message: 'Your properties retrieved',
    data: properties,
  });
}

/**
 * GET /api/properties/stats
 * Get property statistics
 */
export async function getStats(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const userPermissions = ROLE_PERMISSIONS[req.user!.role];
  const isAdmin = userPermissions.includes('admin:access');

  // Admin sees all stats, others see only their own
  const ownerId = isAdmin ? undefined : req.user!.userId;
  const stats = await propertyService.getPropertyStats(ownerId);

  res.json({
    success: true,
    message: 'Statistics retrieved',
    data: stats,
  });
}

/**
 * GET /api/properties/nearby
 * Get properties near a location
 */
export async function getNearbyProperties(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const lng = parseFloat(req.query.lng as string);
  const lat = parseFloat(req.query.lat as string);
  const radius = req.query.radius ? parseFloat(req.query.radius as string) : 10;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  if (isNaN(lng) || isNaN(lat)) {
    res.status(400).json({
      success: false,
      message: 'Valid longitude and latitude are required',
    });
    return;
  }

  const properties = await propertyService.findNearbyProperties(lng, lat, radius, limit);

  res.json({
    success: true,
    message: 'Nearby properties retrieved',
    data: properties,
  });
}

/**
 * GET /api/properties/:id
 * Get a property by ID
 */
export async function getProperty(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const property = await propertyService.getPropertyById(req.params.id);

  res.json({
    success: true,
    message: 'Property retrieved',
    data: property,
  });
}

/**
 * PATCH /api/properties/:id
 * Update a property
 */
export async function updateProperty(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const data = validate(updatePropertySchema, req.body);
  const userPermissions = ROLE_PERMISSIONS[req.user!.role];
  const isAdmin = userPermissions.includes('property:update:any');

  const property = await propertyService.updateProperty(
    req.params.id,
    req.user!.userId,
    data,
    isAdmin
  );

  res.json({
    success: true,
    message: 'Property updated successfully',
    data: property,
  });
}

/**
 * PATCH /api/properties/:id/status
 * Update property status
 */
export async function updatePropertyStatus(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { status } = req.body;
  const userPermissions = ROLE_PERMISSIONS[req.user!.role];
  const isAdmin = userPermissions.includes('property:update:any');

  const property = await propertyService.updatePropertyStatus(
    req.params.id,
    status,
    req.user!.userId,
    isAdmin
  );

  res.json({
    success: true,
    message: 'Property status updated successfully',
    data: property,
  });
}

/**
 * DELETE /api/properties/:id
 * Delete a property (soft delete)
 */
export async function deleteProperty(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const userPermissions = ROLE_PERMISSIONS[req.user!.role];
  const isAdmin = userPermissions.includes('property:delete:any');

  await propertyService.deleteProperty(req.params.id, req.user!.userId, isAdmin);

  res.json({
    success: true,
    message: 'Property deleted successfully',
  });
}

/**
 * POST /api/properties/:id/feature
 * Toggle featured status (admin only)
 */
export async function toggleFeatured(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const property = await propertyService.toggleFeatured(req.params.id);

  res.json({
    success: true,
    message: `Property ${property.isFeatured ? 'featured' : 'unfeatured'} successfully`,
    data: property,
  });
}
