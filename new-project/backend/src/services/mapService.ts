import fs from 'fs/promises';
import { Map } from '../models/Map.js';
import { Project } from '../models/Project.js';
import { AppError } from '../utils/AppError.js';
import { PublicMap, IMapDocument, MapFileType } from '../types/index.js';
import { getFileTypeFromExtension } from '../middleware/upload.js';

// ============================================
// Map Service
// ============================================

interface UploadMapInput {
  projectId: string;
  userId: string;
  name: string;
  description?: string;
  file: Express.Multer.File;
}

interface UpdateMapInput {
  name?: string;
  description?: string;
}

/**
 * Upload a new map to a project
 */
export async function uploadMap(input: UploadMapInput): Promise<PublicMap> {
  const { projectId, userId, name, description, file } = input;

  // Verify project exists and user has access
  const project = await Project.findById(projectId);
  if (!project) {
    // Clean up uploaded file
    await fs.unlink(file.path).catch(() => {});
    throw AppError.notFound('Project not found');
  }

  // Check if user is the owner
  if (project.owner.toString() !== userId) {
    await fs.unlink(file.path).catch(() => {});
    throw AppError.forbidden('You can only upload maps to your own projects');
  }

  // Determine file type
  const fileType = getFileTypeFromExtension(file.originalname);

  // Check for existing map with same name to determine version
  const existingMap = await Map.findLatestVersion(projectId, name);
  const version = existingMap ? existingMap.version + 1 : 1;

  // Create map record
  const map = await Map.create({
    project: projectId,
    name,
    description,
    fileType,
    originalFileName: file.originalname,
    storagePath: file.path,
    fileSize: file.size,
    mimeType: file.mimetype,
    status: 'ready', // For now, mark as ready immediately
    version,
    uploadedBy: userId,
    metadata: {},
  });

  await map.populate('uploadedBy', 'id fullName email');

  return map.toPublicJSON();
}

/**
 * Get all maps for a project
 */
export async function getProjectMaps(projectId: string, userId?: string): Promise<PublicMap[]> {
  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  // Check access - only owner can view maps of private projects
  const isOwner = userId === project.owner.toString();
  if (!project.isPublic && !isOwner) {
    throw AppError.forbidden('You do not have access to this project');
  }

  const maps = await Map.findByProject(projectId);
  return maps.map((m: IMapDocument) => m.toPublicJSON());
}

/**
 * Get a single map by ID
 */
export async function getMapById(mapId: string, userId?: string): Promise<PublicMap> {
  const map = await Map.findById(mapId)
    .populate('uploadedBy', 'id fullName email')
    .populate('project');

  if (!map) {
    throw AppError.notFound('Map not found');
  }

  // Check access
  const project = await Project.findById(map.project);
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const isOwner = userId === project.owner.toString();
  if (!project.isPublic && !isOwner) {
    throw AppError.forbidden('You do not have access to this map');
  }

  return map.toPublicJSON();
}

/**
 * Get map file path for download
 */
export async function getMapFilePath(
  mapId: string,
  userId?: string
): Promise<{ path: string; filename: string; mimeType: string }> {
  const map = await Map.findById(mapId);

  if (!map) {
    throw AppError.notFound('Map not found');
  }

  // Check access
  const project = await Project.findById(map.project);
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const isOwner = userId === project.owner.toString();
  if (!project.isPublic && !isOwner) {
    throw AppError.forbidden('You do not have access to this file');
  }

  // Verify file exists
  try {
    await fs.access(map.storagePath);
  } catch {
    throw AppError.notFound('File not found on server');
  }

  return {
    path: map.storagePath,
    filename: map.originalFileName,
    mimeType: map.mimeType,
  };
}

/**
 * Update map metadata
 */
export async function updateMap(
  mapId: string,
  userId: string,
  data: UpdateMapInput
): Promise<PublicMap> {
  const map = await Map.findById(mapId);

  if (!map) {
    throw AppError.notFound('Map not found');
  }

  // Check ownership
  const project = await Project.findById(map.project);
  if (!project || project.owner.toString() !== userId) {
    throw AppError.forbidden('You can only update maps in your own projects');
  }

  // Update fields
  if (data.name) map.name = data.name;
  if (data.description !== undefined) map.description = data.description;

  await map.save();
  await map.populate('uploadedBy', 'id fullName email');

  return map.toPublicJSON();
}

/**
 * Delete a map
 */
export async function deleteMap(
  mapId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<void> {
  const map = await Map.findById(mapId);

  if (!map) {
    throw AppError.notFound('Map not found');
  }

  // Check ownership
  const project = await Project.findById(map.project);
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  if (project.owner.toString() !== userId && !isAdmin) {
    throw AppError.forbidden('You can only delete maps from your own projects');
  }

  // Delete file from storage
  try {
    await fs.unlink(map.storagePath);
  } catch (error) {
    console.error('Failed to delete file:', error);
    // Continue with deletion even if file removal fails
  }

  await map.deleteOne();
}

/**
 * Get map statistics for a project
 */
export async function getMapStats(projectId: string): Promise<{
  totalMaps: number;
  totalSize: number;
  byType: Record<MapFileType, number>;
}> {
  const maps = await Map.find({ project: projectId });

  const stats = {
    totalMaps: maps.length,
    totalSize: 0,
    byType: {
      cad: 0,
      pdf: 0,
      image: 0,
    } as Record<MapFileType, number>,
  };

  for (const map of maps) {
    stats.totalSize += map.fileSize;
    stats.byType[map.fileType]++;
  }

  return stats;
}
