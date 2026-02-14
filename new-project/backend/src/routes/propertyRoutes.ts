import { Router } from 'express';
import * as propertyController from '../controllers/propertyController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { hasPermission, hasAnyPermission } from '../middleware/permissions.js';

const router = Router();

// ============================================
// Public Routes
// ============================================

// GET /api/properties - Search/list properties (public)
router.get('/', optionalAuth, propertyController.getProperties);

// GET /api/properties/featured - Get featured properties (public)
router.get('/featured', optionalAuth, propertyController.getFeaturedProperties);

// GET /api/properties/nearby - Get nearby properties (public)
router.get('/nearby', optionalAuth, propertyController.getNearbyProperties);

// ============================================
// Protected Routes (require authentication)
// ============================================

// GET /api/properties/my - Get current user's properties
router.get('/my', authenticate, propertyController.getMyProperties);

// GET /api/properties/stats - Get statistics
router.get(
  '/stats',
  authenticate,
  hasAnyPermission('analytics:view', 'admin:access'),
  propertyController.getStats
);

// POST /api/properties - Create a new property
router.post('/', authenticate, hasPermission('property:create'), propertyController.createProperty);

// ============================================
// Property-specific Routes (with :id param)
// ============================================

// GET /api/properties/:id - Get property details (public)
router.get('/:id', optionalAuth, propertyController.getProperty);

// PATCH /api/properties/:id - Update a property
router.patch(
  '/:id',
  authenticate,
  hasAnyPermission('property:update:own', 'property:update:any'),
  propertyController.updateProperty
);

// PATCH /api/properties/:id/status - Update property status
router.patch(
  '/:id/status',
  authenticate,
  hasAnyPermission('property:update:own', 'property:update:any'),
  propertyController.updatePropertyStatus
);

// DELETE /api/properties/:id - Delete a property
router.delete(
  '/:id',
  authenticate,
  hasAnyPermission('property:delete:own', 'property:delete:any'),
  propertyController.deleteProperty
);

// ============================================
// Admin Routes
// ============================================

// POST /api/properties/:id/feature - Toggle featured (admin only)
router.post(
  '/:id/feature',
  authenticate,
  hasPermission('admin:access'),
  propertyController.toggleFeatured
);

export default router;
