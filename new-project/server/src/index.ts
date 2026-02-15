import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import routes from './routes/index.js';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (config.isDevelopment) {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    messageAr: 'النقطة النهائية غير موجودة',
  });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: config.isDevelopment ? err.message : 'Internal server error',
      messageAr: 'خطأ في الخادم',
    });
  }
);

// Start server
app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🏠 Upgreat API Server                       ║
║                                               ║
║   Running on: http://localhost:${config.port}        ║
║   Environment: ${config.nodeEnv.padEnd(25)}  ║
║                                               ║
║   Endpoints:                                  ║
║   • POST /api/auth/register                   ║
║   • POST /api/auth/login                      ║
║   • POST /api/auth/logout                     ║
║   • POST /api/auth/refresh                    ║
║   • GET  /api/auth/me                         ║
║   • PATCH /api/auth/me                        ║
║   • POST /api/auth/change-password            ║
║                                               ║
║   Default admin: admin@upgreat.sa / admin123  ║
║                                               ║
╚═══════════════════════════════════════════════╝
`);
});

export default app;
