import { Property } from '../models/Property.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import {
  PublicProperty,
  IPropertyDocument,
  CreatePropertyDTO,
  UpdatePropertyDTO,
  PropertyQueryDTO,
  PropertyStatus,
} from '../types/index.js';

// ============================================
// Types
// ============================================

interface PaginatedProperties {
  properties: PublicProperty[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PropertyStats {
  totalProperties: number;
  activeListings: number;
  soldProperties: number;
  rentedProperties: number;
  totalViews: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

// ============================================
// Property Service
// ============================================

/**
 * Create a new property
 */
export async function createProperty(
  ownerId: string,
  data: CreatePropertyDTO,
  agentId?: string
): Promise<PublicProperty> {
  // Verify owner exists
  const owner = await User.findById(ownerId);
  if (!owner) {
    throw AppError.notFound('User not found');
  }

  // Verify agent exists if provided
  if (agentId) {
    const agent = await User.findById(agentId);
    if (!agent) {
      throw AppError.notFound('Agent not found');
    }
  }

  const property = await Property.create({
    ...data,
    owner: ownerId,
    agent: agentId || undefined,
  });

  // Populate and return
  const populated = await Property.findById(property._id)
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar');

  return populated!.toPublicJSON();
}

/**
 * Get a property by ID
 */
export async function getPropertyById(
  propertyId: string,
  incrementViews: boolean = true
): Promise<PublicProperty> {
  const property = await Property.findById(propertyId)
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar');

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  // Increment view count
  if (incrementViews) {
    await Property.updateOne({ _id: propertyId }, { $inc: { viewCount: 1 } });
    property.viewCount += 1;
  }

  return property.toPublicJSON();
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
    status,
    category,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    city,
    lng,
    lat,
    radius = 10,
    featured,
  } = query;

  const skip = (page - 1) * limit;

  // Build filter object
  const filter: Record<string, unknown> = { isActive: true };

  // Text search
  if (q) {
    filter.$text = { $search: q };
  }

  // Type filter (can be array)
  if (type && type.length > 0) {
    filter.type = { $in: type };
  }

  // Status filter (can be array)
  if (status && status.length > 0) {
    filter.status = { $in: status };
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) (filter.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined) (filter.price as Record<string, number>).$lte = maxPrice;
  }

  // Area range
  if (minArea !== undefined || maxArea !== undefined) {
    filter.area = {};
    if (minArea !== undefined) (filter.area as Record<string, number>).$gte = minArea;
    if (maxArea !== undefined) (filter.area as Record<string, number>).$lte = maxArea;
  }

  // Bedrooms (minimum)
  if (bedrooms !== undefined) {
    filter.bedrooms = { $gte: bedrooms };
  }

  // Bathrooms (minimum)
  if (bathrooms !== undefined) {
    filter.bathrooms = { $gte: bathrooms };
  }

  // City filter (case-insensitive)
  if (city) {
    filter.$or = [
      { 'location.city': { $regex: city, $options: 'i' } },
      { 'location.cityAr': { $regex: city, $options: 'i' } },
    ];
  }

  // Featured filter
  if (featured !== undefined) {
    filter.isFeatured = featured;
  }

  // Geo-spatial proximity search
  if (lng !== undefined && lat !== undefined) {
    filter['location.coordinates'] = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: radius * 1000, // Convert km to meters
      },
    };
  }

  // Build sort object
  type SortOrder = 1 | -1 | { $meta: 'textScore' };
  const sortMap: Record<string, Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    area_asc: { area: 1 },
    area_desc: { area: -1 },
  };
  const sortObj: Record<string, SortOrder> = sortMap[sort]
    ? { ...sortMap[sort] }
    : { createdAt: -1 };

  // Add text score sorting if text search
  if (q) {
    sortObj.score = { $meta: 'textScore' };
  }

  // Execute queries in parallel
  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate('owner', 'id fullName email phone avatar')
      .populate('agent', 'id fullName email phone avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  return {
    properties: properties.map((p: IPropertyDocument) => p.toPublicJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get properties by owner
 */
export async function getPropertiesByOwner(
  ownerId: string,
  includeInactive: boolean = false
): Promise<PublicProperty[]> {
  const filter: Record<string, unknown> = { owner: ownerId };
  if (!includeInactive) {
    filter.isActive = true;
  }

  const properties = await Property.find(filter)
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar')
    .sort({ createdAt: -1 });

  return properties.map((p: IPropertyDocument) => p.toPublicJSON());
}

/**
 * Update a property
 */
export async function updateProperty(
  propertyId: string,
  userId: string,
  data: UpdatePropertyDTO,
  isAdmin: boolean = false
): Promise<PublicProperty> {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  // Check ownership (unless admin)
  if (!isAdmin && property.owner.toString() !== userId) {
    throw AppError.forbidden('You can only update your own properties');
  }

  // Update fields
  Object.assign(property, data);
  await property.save();

  // Populate and return
  const populated = await Property.findById(property._id)
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar');

  return populated!.toPublicJSON();
}

/**
 * Delete a property (soft delete)
 */
export async function deleteProperty(
  propertyId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<void> {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  // Check ownership (unless admin)
  if (!isAdmin && property.owner.toString() !== userId) {
    throw AppError.forbidden('You can only delete your own properties');
  }

  // Soft delete by setting isActive to false
  property.isActive = false;
  await property.save();
}

/**
 * Get property statistics
 */
export async function getPropertyStats(ownerId?: string): Promise<PropertyStats> {
  const filter: Record<string, unknown> = {};
  if (ownerId) {
    filter.owner = ownerId;
  }

  const properties = await Property.find(filter);

  const stats: PropertyStats = {
    totalProperties: properties.length,
    activeListings: properties.filter((p) => p.isActive && !['sold', 'rented'].includes(p.status))
      .length,
    soldProperties: properties.filter((p) => p.status === 'sold').length,
    rentedProperties: properties.filter((p) => p.status === 'rented').length,
    totalViews: properties.reduce((sum, p) => sum + p.viewCount, 0),
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  };

  for (const property of properties) {
    stats.byType[property.type] = (stats.byType[property.type] || 0) + 1;
    stats.byStatus[property.status] = (stats.byStatus[property.status] || 0) + 1;
  }

  return stats;
}

/**
 * Toggle featured status (admin only)
 */
export async function toggleFeatured(propertyId: string): Promise<PublicProperty> {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  property.isFeatured = !property.isFeatured;
  await property.save();

  const populated = await Property.findById(property._id)
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar');

  return populated!.toPublicJSON();
}

/**
 * Update property status
 */
export async function updatePropertyStatus(
  propertyId: string,
  status: PropertyStatus,
  userId: string,
  isAdmin: boolean = false
): Promise<PublicProperty> {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  // Check ownership (unless admin)
  if (!isAdmin && property.owner.toString() !== userId) {
    throw AppError.forbidden('You can only update your own properties');
  }

  property.status = status;
  await property.save();

  const populated = await Property.findById(property._id)
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar');

  return populated!.toPublicJSON();
}

/**
 * Find properties nearby a location
 */
export async function findNearbyProperties(
  longitude: number,
  latitude: number,
  maxDistanceKm: number = 10,
  limit: number = 20
): Promise<PublicProperty[]> {
  const properties = await Property.find({
    'location.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceKm * 1000,
      },
    },
    isActive: true,
  })
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar')
    .limit(limit);

  return properties.map((p: IPropertyDocument) => p.toPublicJSON());
}

/**
 * Get featured properties
 */
export async function getFeaturedProperties(limit: number = 6): Promise<PublicProperty[]> {
  const properties = await Property.find({ isFeatured: true, isActive: true })
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar')
    .sort({ createdAt: -1 })
    .limit(limit);

  return properties.map((p: IPropertyDocument) => p.toPublicJSON());
}
