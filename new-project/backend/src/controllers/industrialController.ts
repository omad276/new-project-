import { Response } from 'express';
import * as industrialService from '../services/industrialService.js';
import { AuthRequest, ApiResponse, FactoryType, ZoningType } from '../types/index.js';
import { AppError } from '../utils/AppError.js';

// ============================================
// Industrial Controller
// ============================================

/**
 * POST /api/industrial
 * Create industrial data for a property
 */
export async function createIndustrial(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { propertyId, factoryType, zoningType, powerCapacity } = req.body;

  if (!propertyId) {
    throw AppError.badRequest('propertyId is required');
  }
  if (!factoryType) {
    throw AppError.badRequest('factoryType is required');
  }
  if (!zoningType) {
    throw AppError.badRequest('zoningType is required');
  }
  if (!powerCapacity || typeof powerCapacity.value !== 'number') {
    throw AppError.badRequest('powerCapacity.value is required');
  }

  const industrial = await industrialService.createIndustrial(req.user!.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Industrial data created successfully',
    data: industrial,
  });
}

/**
 * GET /api/industrial/:id
 * Get industrial data by ID
 */
export async function getIndustrial(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const industrial = await industrialService.getIndustrialById(req.params.id);

  res.json({
    success: true,
    message: 'Industrial data retrieved',
    data: industrial,
  });
}

/**
 * GET /api/properties/:propertyId/industrial
 * Get industrial data by property ID
 */
export async function getIndustrialByProperty(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const industrial = await industrialService.getIndustrialByProperty(req.params.propertyId);

  res.json({
    success: true,
    message: 'Industrial data retrieved',
    data: industrial,
  });
}

/**
 * GET /api/industrial
 * List all industrial data with filters
 */
export async function listIndustrial(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const {
    page,
    limit,
    factoryType,
    zoningType,
    minPowerCapacity,
    maxPowerCapacity,
    hasWaterAccess,
    minCeilingHeight,
    hasLoadingDocks,
    environmentalCompliance,
  } = req.query;

  const result = await industrialService.listIndustrial({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    factoryType: factoryType as FactoryType | undefined,
    zoningType: zoningType as ZoningType | undefined,
    minPowerCapacity: minPowerCapacity ? parseFloat(minPowerCapacity as string) : undefined,
    maxPowerCapacity: maxPowerCapacity ? parseFloat(maxPowerCapacity as string) : undefined,
    hasWaterAccess:
      hasWaterAccess === 'true' ? true : hasWaterAccess === 'false' ? false : undefined,
    minCeilingHeight: minCeilingHeight ? parseFloat(minCeilingHeight as string) : undefined,
    hasLoadingDocks:
      hasLoadingDocks === 'true' ? true : hasLoadingDocks === 'false' ? false : undefined,
    environmentalCompliance:
      environmentalCompliance === 'true'
        ? true
        : environmentalCompliance === 'false'
          ? false
          : undefined,
  });

  res.json({
    success: true,
    message: 'Industrial data retrieved',
    data: result.data,
    pagination: result.pagination,
  });
}

/**
 * PATCH /api/industrial/:id
 * Update industrial data
 */
export async function updateIndustrial(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const industrial = await industrialService.updateIndustrial(
    req.params.id,
    req.user!.userId,
    req.body
  );

  res.json({
    success: true,
    message: 'Industrial data updated successfully',
    data: industrial,
  });
}

/**
 * DELETE /api/industrial/:id
 * Delete industrial data
 */
export async function deleteIndustrial(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const isAdmin = req.user!.role === 'admin';

  await industrialService.deleteIndustrial(req.params.id, req.user!.userId, isAdmin);

  res.json({
    success: true,
    message: 'Industrial data deleted successfully',
  });
}

/**
 * GET /api/industrial/stats
 * Get industrial statistics
 */
export async function getIndustrialStats(
  _req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const stats = await industrialService.getIndustrialStats();

  res.json({
    success: true,
    message: 'Industrial statistics retrieved',
    data: stats,
  });
}
