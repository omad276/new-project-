import mongoose, { Schema, Model } from 'mongoose';
import {
  IPropertyDocument,
  PublicProperty,
  PropertyType,
  PropertyStatus,
  PropertyCategory,
  PROPERTY_CATEGORY_MAP,
} from '../types/index.js';

// ============================================
// Location Sub-Schema (GeoJSON Point)
// ============================================

const locationSchema = new Schema(
  {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address is too long'],
    },
    addressAr: {
      type: String,
      required: [true, 'Arabic address is required'],
      trim: true,
      maxlength: [500, 'Arabic address is too long'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name is too long'],
    },
    cityAr: {
      type: String,
      required: [true, 'Arabic city name is required'],
      trim: true,
      maxlength: [100, 'Arabic city name is too long'],
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Saudi Arabia',
    },
    countryAr: {
      type: String,
      required: true,
      trim: true,
      default: 'المملكة العربية السعودية',
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function (coords: number[]) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message: 'Invalid coordinates. Must be [longitude, latitude]',
        },
      },
    },
  },
  { _id: false }
);

// ============================================
// Property Schema Definition
// ============================================

const propertySchema = new Schema<IPropertyDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title is too long'],
    },
    titleAr: {
      type: String,
      required: [true, 'Arabic title is required'],
      trim: true,
      minlength: [5, 'Arabic title must be at least 5 characters'],
      maxlength: [200, 'Arabic title is too long'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description is too long'],
    },
    descriptionAr: {
      type: String,
      required: [true, 'Arabic description is required'],
      trim: true,
      minlength: [20, 'Arabic description must be at least 20 characters'],
      maxlength: [5000, 'Arabic description is too long'],
    },
    type: {
      type: String,
      enum: [
        'apartment',
        'villa',
        'office',
        'land',
        'building',
        'warehouse',
        'factory',
        'industrial_land',
      ] as PropertyType[],
      required: [true, 'Property type is required'],
    },
    category: {
      type: String,
      enum: ['residential', 'commercial', 'industrial'] as PropertyCategory[],
    },
    status: {
      type: String,
      enum: [
        'for_sale',
        'for_rent',
        'off_plan',
        'investment',
        'sold',
        'rented',
      ] as PropertyStatus[],
      required: [true, 'Status is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR', 'AED'],
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area must be positive'],
    },
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Location is required'],
    },
    images: [
      {
        type: String,
        validate: {
          validator: (v: string) => /^https?:\/\/.+/.test(v),
          message: 'Invalid image URL',
        },
      },
    ],
    features: [{ type: String, trim: true, maxlength: 100 }],
    featuresAr: [{ type: String, trim: true, maxlength: 100 }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ============================================
// Indexes
// ============================================

// Text index for search (weighted)
propertySchema.index(
  {
    title: 'text',
    titleAr: 'text',
    description: 'text',
    descriptionAr: 'text',
    'location.city': 'text',
    'location.cityAr': 'text',
  },
  {
    weights: {
      title: 10,
      titleAr: 10,
      'location.city': 5,
      'location.cityAr': 5,
      description: 1,
      descriptionAr: 1,
    },
    name: 'property_text_search',
  }
);

// Geo-spatial index for proximity search
propertySchema.index({ 'location.coordinates': '2dsphere' });

// Compound indexes for common queries
propertySchema.index({ status: 1, type: 1, isActive: 1 });
propertySchema.index({ status: 1, price: 1 });
propertySchema.index({ category: 1, status: 1 });
propertySchema.index({ 'location.city': 1, status: 1 });
propertySchema.index({ owner: 1, createdAt: -1 });
propertySchema.index({ agent: 1, createdAt: -1 });
propertySchema.index({ isFeatured: 1, createdAt: -1 });
propertySchema.index({ type: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ area: 1 });
propertySchema.index({ bedrooms: 1 });

// ============================================
// Pre-save Middleware
// ============================================

propertySchema.pre('save', function (next) {
  // Auto-calculate category from type
  this.category = PROPERTY_CATEGORY_MAP[this.type];
  next();
});

// ============================================
// Instance Methods
// ============================================

/**
 * Convert property document to public JSON
 */
propertySchema.methods.toPublicJSON = function (): PublicProperty {
  const ownerId =
    this.owner instanceof mongoose.Types.ObjectId
      ? this.owner.toString()
      : typeof this.owner === 'object' && this.owner._id
        ? this.owner._id.toString()
        : String(this.owner);

  const agentId = this.agent
    ? this.agent instanceof mongoose.Types.ObjectId
      ? this.agent.toString()
      : typeof this.agent === 'object' && this.agent._id
        ? this.agent._id.toString()
        : String(this.agent)
    : undefined;

  return {
    id: this._id.toString(),
    title: this.title,
    titleAr: this.titleAr,
    description: this.description,
    descriptionAr: this.descriptionAr,
    type: this.type,
    category: this.category,
    status: this.status,
    price: this.price,
    currency: this.currency,
    area: this.area,
    bedrooms: this.bedrooms,
    bathrooms: this.bathrooms,
    location: this.location,
    images: this.images,
    features: this.features,
    featuresAr: this.featuresAr,
    owner: ownerId,
    agent: agentId,
    isActive: this.isActive,
    isFeatured: this.isFeatured,
    viewCount: this.viewCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// ============================================
// Static Methods
// ============================================

interface PropertyModel extends Model<IPropertyDocument> {
  findByOwner(ownerId: string): Promise<IPropertyDocument[]>;
  findNearby(
    longitude: number,
    latitude: number,
    maxDistanceKm?: number
  ): Promise<IPropertyDocument[]>;
}

/**
 * Find all properties by owner
 */
propertySchema.statics.findByOwner = function (ownerId: string) {
  return this.find({ owner: ownerId, isActive: true })
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar')
    .sort({ createdAt: -1 });
};

/**
 * Find properties near a location
 */
propertySchema.statics.findNearby = function (
  longitude: number,
  latitude: number,
  maxDistanceKm: number = 10
) {
  return this.find({
    'location.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceKm * 1000, // Convert km to meters
      },
    },
    isActive: true,
  })
    .populate('owner', 'id fullName email phone avatar')
    .populate('agent', 'id fullName email phone avatar');
};

// ============================================
// Export Model
// ============================================

export const Property = mongoose.model<IPropertyDocument, PropertyModel>(
  'Property',
  propertySchema
);
export default Property;
