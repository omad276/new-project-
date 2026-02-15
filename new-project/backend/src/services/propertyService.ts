import Property from '../models/Property.js';
import { AppError } from '../utils/AppError.js';
import { CreatePropertyDTO, UpdatePropertyDTO, PropertyQueryDTO } from '../types/index.js';

// ============================================
// Types
// ============================================

interface PaginatedProperties {
  properties: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PropertyStats {
  totalProperties: number;
  available: number;
  sold: number;
  rented: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

// ============================================
// Property Service
// ============================================

/**
 * Create a new property
 */
export async function createProperty(data: CreatePropertyDTO): Promise<unknown> {
  const property = await Property.create(data);
  return property;
}

/**
 * Get a property by ID
 */
export async function getPropertyById(propertyId: string): Promise<unknown> {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  return property;
}

/**
 * Search and filter properties with pagination
 */
export async function searchProperties(query: PropertyQueryDTO): Promise<PaginatedProperties> {
  const {
    page = 1,
    limit = 12,
    q,
    sort = 'newest',
    type,
    category,
    status,
    minPrice,
    maxPrice,
    minSize,
    maxSize,
    city,
  } = query;

  const skip = (page - 1) * limit;

  // Build filter object
  const filter: Record<string, unknown> = {};

  // Text search (simple regex on title/description)
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  // Type filter
  if (type) {
    filter.type = Array.isArray(type) ? { $in: type } : type;
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) (filter.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined) (filter.price as Record<string, number>).$lte = maxPrice;
  }

  // Size range
  if (minSize !== undefined || maxSize !== undefined) {
    filter.size = {};
    if (minSize !== undefined) (filter.size as Record<string, number>).$gte = minSize;
    if (maxSize !== undefined) (filter.size as Record<string, number>).$lte = maxSize;
  }

  // City filter
  if (city) {
    filter['location.city'] = { $regex: city, $options: 'i' };
  }

  // Build sort object
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    size_asc: { size: 1 },
    size_desc: { size: -1 },
  };
  const sortObj = sortMap[sort] || { createdAt: -1 };

  // Execute queries in parallel
  const [properties, total] = await Promise.all([
    Property.find(filter).sort(sortObj).skip(skip).limit(limit),
    Property.countDocuments(filter),
  ]);

  return {
    properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update a property
 */
export async function updateProperty(
  propertyId: string,
  data: UpdatePropertyDTO
): Promise<unknown> {
  const property = await Property.findByIdAndUpdate(
    propertyId,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  return property;
}

/**
 * Delete a property
 */
export async function deleteProperty(propertyId: string): Promise<void> {
  const property = await Property.findByIdAndDelete(propertyId);

  if (!property) {
    throw AppError.notFound('Property not found');
  }
}

/**
 * Get property statistics
 */
export async function getPropertyStats(): Promise<PropertyStats> {
  const properties = await Property.find();

  const stats: PropertyStats = {
    totalProperties: properties.length,
    available: properties.filter((p) => p.status === 'available').length,
    sold: properties.filter((p) => p.status === 'sold').length,
    rented: properties.filter((p) => p.status === 'rented').length,
    byType: {},
    byCategory: {},
  };

  for (const property of properties) {
    stats.byType[property.type] = (stats.byType[property.type] || 0) + 1;
    stats.byCategory[property.category] = (stats.byCategory[property.category] || 0) + 1;
  }

  return stats;
}

/**
 * Get all properties (no pagination)
 */
export async function getAllProperties(): Promise<unknown[]> {
  return Property.find().sort({ createdAt: -1 });
}
