import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['sale', 'rent', 'investment', 'partnership'],
      required: true,
    },
    category: {
      type: String,
      enum: ['residential', 'commercial', 'industrial', 'land'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    location: {
      country: String,
      city: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    size: Number,
    sizeUnit: {
      type: String,
      enum: ['sqm', 'sqft'],
      default: 'sqm',
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'rented'],
      default: 'available',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Property', propertySchema);
