import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';

const router = Router();

// ============================================
// Health Check
// ============================================

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Upgreat API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============================================
// Mount Routes
// ============================================

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

export default router;
