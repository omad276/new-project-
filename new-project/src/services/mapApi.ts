import api from '@/lib/api';
import type { BlueprintMap, ScaleUnit } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Transform backend map to frontend format
function transformMap(map: BlueprintMap): BlueprintMap {
  return {
    ...map,
    // Ensure downloadUrl is a full URL
    downloadUrl: map.downloadUrl?.startsWith('http')
      ? map.downloadUrl
      : `${API_BASE_URL.replace('/api', '')}${map.downloadUrl}`,
  };
}

export const mapApi = {
  // Get a single map by ID
  async getMap(mapId: string): Promise<BlueprintMap> {
    const response = await api.get<BlueprintMap>(`/maps/${mapId}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch map');
    }
    return transformMap(response.data);
  },

  // Get all maps for a project
  async getProjectMaps(projectId: string): Promise<BlueprintMap[]> {
    const response = await api.get<BlueprintMap[]>(`/projects/${projectId}/maps`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch maps');
    }
    return response.data.map(transformMap);
  },

  // Get all maps for a property
  async getPropertyMaps(propertyId: string): Promise<BlueprintMap[]> {
    const response = await api.get<BlueprintMap[]>(`/properties/${propertyId}/maps`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch maps');
    }
    return response.data.map(transformMap);
  },

  // Upload a new map (multipart form)
  async uploadMap(
    projectId: string,
    file: File,
    name: string,
    description?: string
  ): Promise<BlueprintMap> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (description) formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/maps`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('upgreat_access_token')}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to upload map');
    }
    return transformMap(data.data);
  },

  // Update a map
  async updateMap(
    mapId: string,
    data: { name?: string; description?: string }
  ): Promise<BlueprintMap> {
    const response = await api.patch<BlueprintMap>(`/maps/${mapId}`, data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update map');
    }
    return transformMap(response.data);
  },

  // Delete a map
  async deleteMap(mapId: string): Promise<void> {
    const response = await api.delete(`/maps/${mapId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete map');
    }
  },

  // Get map statistics for a project
  async getMapStats(projectId: string): Promise<{
    totalMaps: number;
    totalSize: number;
    byType: Record<string, number>;
  }> {
    const response = await api.get<{
      totalMaps: number;
      totalSize: number;
      byType: Record<string, number>;
    }>(`/projects/${projectId}/maps/stats`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch map stats');
    }
    return response.data;
  },

  // Calibrate map scale for real-world measurements
  async calibrateMap(
    mapId: string,
    data: { pixelDistance: number; realDistance: number; unit: ScaleUnit }
  ): Promise<BlueprintMap> {
    const response = await api.patch<BlueprintMap>(`/maps/${mapId}/calibrate`, data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to calibrate map');
    }
    return transformMap(response.data);
  },
};

export default mapApi;
