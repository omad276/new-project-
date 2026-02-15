import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { authenticate } from '../middleware/index.js';

const router = Router();

// ============================================
// Public Routes (no authentication required)
// ============================================

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refresh);

// POST /api/auth/logout - Logout user
router.post('/logout', authController.logout);

// ============================================
// Protected Routes (authentication required)
// ============================================

// GET /api/auth/me - Get current user profile
router.get('/me', authenticate, authController.getProfile);

// PATCH /api/auth/me - Update current user profile
router.patch('/me', authenticate, authController.updateProfile);

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticate, authController.changePassword);

// DELETE /api/auth/me - Deactivate account
router.delete('/me', authenticate, authController.deactivateAccount);

export default router;
