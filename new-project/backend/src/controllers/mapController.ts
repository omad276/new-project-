import { Response } from 'express';
import path from 'path';
import { mapService } from '../services/index.js';
import { AuthRequest, ApiResponse } from '../types/index.js';
import { AppError } from '../utils/AppError.js';

// ============================================
// Map Controller
// ============================================

/**
 * POST /api/projects/:projectId/maps
 * Upload a new map to a project
 */
export async function uploadMap(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  if (!req.file) {
    throw AppError.badRequest('No file uploaded');
  }

  const { projectId } = req.params;
  const { name, description } = req.body;

  if (!name) {
    throw AppError.badRequest('Map name is required');
  }

  const map = await mapService.uploadMap({
    projectId,
    userId: req.user!.userId,
    name,
    description,
    file: req.file,
  });

  res.status(201).json({
    success: true,
    message: 'Map uploaded successfully',
    data: map,
  });
}

/**
 * GET /api/projects/:projectId/maps
 * Get all maps for a project
 */
export async function getProjectMaps(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const { projectId } = req.params;
  const maps = await mapService.getProjectMaps(projectId, req.user?.userId);

  res.json({
    success: true,
    message: 'Maps retrieved',
    data: maps,
  });
}

/**
 * GET /api/maps/:id
 * Get a single map by ID
 */
export async function getMap(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const map = await mapService.getMapById(req.params.id, req.user?.userId);

  res.json({
    success: true,
    message: 'Map retrieved',
    data: map,
  });
}

/**
 * GET /api/maps/:id/download
 * Download a map file
 */
export async function downloadMap(req: AuthRequest, res: Response): Promise<void> {
  const fileInfo = await mapService.getMapFilePath(req.params.id, req.user?.userId);

  res.setHeader('Content-Type', fileInfo.mimeType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`
  );

  res.sendFile(path.resolve(fileInfo.path));
}

/**
 * PATCH /api/maps/:id
 * Update map metadata
 */
export async function updateMap(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const { name, description } = req.body;

  const map = await mapService.updateMap(req.params.id, req.user!.userId, {
    name,
    description,
  });

  res.json({
    success: true,
    message: 'Map updated successfully',
    data: map,
  });
}

/**
 * DELETE /api/maps/:id
 * Delete a map
 */
export async function deleteMap(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const isAdmin = req.user!.role === 'admin';
  await mapService.deleteMap(req.params.id, req.user!.userId, isAdmin);

  res.json({
    success: true,
    message: 'Map deleted successfully',
  });
}

/**
 * GET /api/projects/:projectId/maps/stats
 * Get map statistics for a project
 */
export async function getMapStats(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
  const { projectId } = req.params;
  const stats = await mapService.getMapStats(projectId);

  res.json({
    success: true,
    message: 'Map statistics retrieved',
    data: stats,
  });
}
