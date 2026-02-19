import type { Property } from './index';

export interface FavoriteProperty {
  id: string;
  property: Property;
  collectionId?: string;
  notes?: string;
  addedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  color: string;
  icon: string;
  propertyIds: string[];
  isDefault?: boolean;
  isShared?: boolean;
  shareLink?: string;
  createdAt: Date;
  updatedAt: Date;
}
