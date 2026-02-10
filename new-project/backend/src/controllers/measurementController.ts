import { Response } from 'express';
import { measurementService } from '../services/index.js';
import { AuthRequest, ApiResponse } from '../types/index.js';
import { AppError } from '../utils/AppError.js';

// ============================================
// Measurement Controller
// ============================================

/**
 * POST /api/maps/:mapId/measurements
 * Create a new measurement on a map
 */
export async function createMeasurement(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { mapId } = req.params;
  const { name, type, points, unit, color, notes } = req.body;

  if (!name || !type || !points) {
    throw AppError.badRequest('Name, type, and points are required');
  }

  const measurement = await measurementService.createMeasurement({
    mapId,
    userId: req.user!.userId,
    name,
    type,
    points,
    unit,
    color,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Measurement created successfully',
    data: measurement,
  });
}

/**
 * GET /api/maps/:mapId/measurements
 * Get all measurements for a map
 */
export async function getMapMeasurements(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { mapId } = req.params;
  const measurements = await measurementService.getMapMeasurements(mapId, req.user?.userId);

  res.json({
    success: true,
    message: 'Measurements retrieved',
    data: measurements,
  });
}

/**
 * GET /api/projects/:projectId/measurements
 * Get all measurements for a project
 */
export async function getProjectMeasurements(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { projectId } = req.params;
  const measurements = await measurementService.getProjectMeasurements(projectId, req.user?.userId);

  res.json({
    success: true,
    message: 'Measurements retrieved',
    data: measurements,
  });
}

/**
 * GET /api/projects/:projectId/measurements/totals
 * Get measurement totals by type for a project
 */
export async function getMeasurementTotals(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { projectId } = req.params;
  const totals = await measurementService.getMeasurementTotals(projectId);

  res.json({
    success: true,
    message: 'Measurement totals retrieved',
    data: totals,
  });
}

/**
 * GET /api/measurements/:id
 * Get a single measurement
 */
export async function getMeasurement(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const measurement = await measurementService.getMeasurementById(req.params.id, req.user?.userId);

  res.json({
    success: true,
    message: 'Measurement retrieved',
    data: measurement,
  });
}

/**
 * PATCH /api/measurements/:id
 * Update measurement metadata
 */
export async function updateMeasurement(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { name, color, notes } = req.body;

  const measurement = await measurementService.updateMeasurement(req.params.id, req.user!.userId, {
    name,
    color,
    notes,
  });

  res.json({
    success: true,
    message: 'Measurement updated successfully',
    data: measurement,
  });
}

/**
 * DELETE /api/measurements/:id
 * Delete a measurement
 */
export async function deleteMeasurement(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const isAdmin = req.user!.role === 'admin';
  await measurementService.deleteMeasurement(req.params.id, req.user!.userId, isAdmin);

  res.json({
    success: true,
    message: 'Measurement deleted successfully',
  });
}

// ============================================
// Cost Estimate Controller
// ============================================

/**
 * POST /api/projects/:projectId/estimates
 * Create a new cost estimate
 */
export async function createCostEstimate(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { projectId } = req.params;
  const { name, description, mapId, measurementIds, items, taxRate, currency, notes } = req.body;

  if (!name || !items || !Array.isArray(items)) {
    throw AppError.badRequest('Name and items are required');
  }

  const estimate = await measurementService.createCostEstimate({
    projectId,
    userId: req.user!.userId,
    name,
    description,
    mapId,
    measurementIds,
    items,
    taxRate,
    currency,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Cost estimate created successfully',
    data: estimate,
  });
}

/**
 * GET /api/projects/:projectId/estimates
 * Get all cost estimates for a project
 */
export async function getProjectEstimates(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { projectId } = req.params;
  const estimates = await measurementService.getProjectEstimates(projectId, req.user?.userId);

  res.json({
    success: true,
    message: 'Cost estimates retrieved',
    data: estimates,
  });
}

/**
 * GET /api/projects/:projectId/estimates/summary
 * Get cost summary for a project
 */
export async function getProjectCostSummary(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { projectId } = req.params;
  const summary = await measurementService.getProjectCostSummary(projectId);

  res.json({
    success: true,
    message: 'Cost summary retrieved',
    data: summary,
  });
}

/**
 * GET /api/estimates/:id
 * Get a single cost estimate
 */
export async function getCostEstimate(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const estimate = await measurementService.getCostEstimateById(req.params.id, req.user?.userId);

  res.json({
    success: true,
    message: 'Cost estimate retrieved',
    data: estimate,
  });
}

/**
 * PATCH /api/estimates/:id
 * Update cost estimate
 */
export async function updateCostEstimate(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { name, description, items, taxRate, notes } = req.body;

  const estimate = await measurementService.updateCostEstimate(req.params.id, req.user!.userId, {
    name,
    description,
    items,
    taxRate,
    notes,
  });

  res.json({
    success: true,
    message: 'Cost estimate updated successfully',
    data: estimate,
  });
}

/**
 * DELETE /api/estimates/:id
 * Delete a cost estimate
 */
export async function deleteCostEstimate(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const isAdmin = req.user!.role === 'admin';
  await measurementService.deleteCostEstimate(req.params.id, req.user!.userId, isAdmin);

  res.json({
    success: true,
    message: 'Cost estimate deleted successfully',
  });
}

/**
 * POST /api/projects/:projectId/calculate
 * Calculate costs from measurements
 */
export async function calculateFromMeasurements(
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> {
  const { measurementIds, unitCosts } = req.body;

  if (!measurementIds || !unitCosts) {
    throw AppError.badRequest('measurementIds and unitCosts are required');
  }

  const items = await measurementService.calculateCostFromMeasurements(measurementIds, unitCosts);

  res.json({
    success: true,
    message: 'Costs calculated',
    data: { items, total: items.reduce((sum, item) => sum + item.totalCost, 0) },
  });
}
