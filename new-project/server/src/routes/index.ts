import { Router } from 'express';
import authRoutes from './authRoutes.js';

const router = Router();

// Health check
router.get('/health', (_, res) => {
  res.json({
    success: true,
    message: 'Upgreat API is running',
    messageAr: 'واجهة برمجة أبجريت تعمل',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);

export default router;
