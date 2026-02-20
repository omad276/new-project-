import api from '@/lib/api';
import type { Measurement, CreateMeasurementPayload, MeasurementType } from '@/types';

// Backend measurement type
interface BackendMeasurement {
  id: string;
  map: string;
  project: string;
  name: string;
  type: MeasurementType;
  points: { x: number; y: number; z?: number }[];
  value: number;
  unit: string;
  displayValue: string;
  color?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Transform backend measurement to frontend format
function transformMeasurement(m: BackendMeasurement): Measurement {
  return {
    id: m.id,
    mapId: m.map,
    type: m.type,
    points: m.points,
    value: m.value,
    unit: m.unit,
    color: m.color || '#FF5722',
    name: m.name,
    createdAt: new Date(m.createdAt),
    updatedAt: new Date(m.updatedAt),
  };
}

export const measurementApi = {
  // Get all measurements for a map
  async getMapMeasurements(mapId: string): Promise<Measurement[]> {
    const response = await api.get<BackendMeasurement[]>(`/maps/${mapId}/measurements`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch measurements');
    }
    return response.data.map(transformMeasurement);
  },

  // Get a single measurement
  async getMeasurement(measurementId: string): Promise<Measurement> {
    const response = await api.get<BackendMeasurement>(`/measurements/${measurementId}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch measurement');
    }
    return transformMeasurement(response.data);
  },

  // Create a new measurement
  async createMeasurement(mapId: string, payload: CreateMeasurementPayload): Promise<Measurement> {
    // Transform frontend payload to backend format
    // Note: We do NOT send 'value' - backend calculates it to be the single source of truth
    const backendPayload = {
      name: payload.name,
      type: payload.type,
      points: payload.points,
      unit: payload.unit,
      color: payload.color,
    };

    const response = await api.post<BackendMeasurement>(
      `/maps/${mapId}/measurements`,
      backendPayload
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create measurement');
    }
    return transformMeasurement(response.data);
  },

  // Update a measurement
  async updateMeasurement(
    measurementId: string,
    payload: { name?: string; color?: string; notes?: string }
  ): Promise<Measurement> {
    const response = await api.patch<BackendMeasurement>(`/measurements/${measurementId}`, payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update measurement');
    }
    return transformMeasurement(response.data);
  },

  // Delete a measurement
  async deleteMeasurement(measurementId: string): Promise<void> {
    const response = await api.delete(`/measurements/${measurementId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete measurement');
    }
  },

  // Get all measurements for a project
  async getProjectMeasurements(projectId: string): Promise<Measurement[]> {
    const response = await api.get<BackendMeasurement[]>(`/projects/${projectId}/measurements`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch measurements');
    }
    return response.data.map(transformMeasurement);
  },

  // Get measurement totals for a project
  async getMeasurementTotals(projectId: string): Promise<Record<string, number>> {
    const response = await api.get<Record<string, number>>(
      `/projects/${projectId}/measurements/totals`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch measurement totals');
    }
    return response.data;
  },
};

export default measurementApi;
