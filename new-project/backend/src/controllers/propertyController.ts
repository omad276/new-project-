import { Response } from 'express';
import * as propertyService from '../services/propertyService.js';
import {
  validate,
  createPropertySchema,
  updatePropertySchema,
  propertyQuerySchema,
} from '../utils/validation.js';
import { AuthRequest, ApiResponse } from '../types/index.js';

// ============================================
// Property Controller
// ============================================

/**
 * POST /api/properties
 * Create a new property
 */
export async function createProperty(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const data = validate(createPropertySchema, req.body);
  const property = await propertyService.createProperty(data);

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
 * GET /api/properties/stats
 * Get property statistics
 */
export async function getStats(_req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const stats = await propertyService.getPropertyStats();

  res.json({
    success: true,
    message: 'Statistics retrieved',
    data: stats,
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
  const property = await propertyService.updateProperty(req.params.id, data);

  res.json({
    success: true,
    message: 'Property updated successfully',
    data: property,
  });
}

/**
 * DELETE /api/properties/:id
 * Delete a property
 */
export async function deleteProperty(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  await propertyService.deleteProperty(req.params.id);

  res.json({
    success: true,
    message: 'Property deleted successfully',
  });
}
