import { Router } from 'express';
import * as propertyController from '../controllers/propertyController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// ============================================
// Public Routes
// ============================================

// GET /api/properties - Search/list properties (public)
router.get('/', optionalAuth, propertyController.getProperties);

// GET /api/properties/stats - Get statistics (public)
router.get('/stats', optionalAuth, propertyController.getStats);

// GET /api/properties/:id - Get property details (public)
router.get('/:id', optionalAuth, propertyController.getProperty);

// ============================================
// Protected Routes (require authentication)
// ============================================

// POST /api/properties - Create a new property
router.post('/', authenticate, propertyController.createProperty);

// PATCH /api/properties/:id - Update a property
router.patch('/:id', authenticate, propertyController.updateProperty);

// DELETE /api/properties/:id - Delete a property
router.delete('/:id', authenticate, propertyController.deleteProperty);

export default router;
