import fs from 'fs';
import app from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';

// ============================================
// Ensure Upload Directories Exist
// ============================================

fs.mkdirSync('uploads/maps', { recursive: true });
fs.mkdirSync('uploads/properties', { recursive: true });

// ============================================
// Server Startup
// ============================================

async function startServer(): Promise<void> {
  try {
    // Try to connect to MongoDB (optional for now)
    try {
      await connectDatabase();
    } catch {
      console.warn('⚠️  MongoDB not available - running without database');
    }

    // Start Express server
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏠  UPGREAT API SERVER                                 ║
║                                                          ║
║   Status:      Running                                   ║
║   Port:        ${String(config.port).padEnd(42)}║
║   Environment: ${config.nodeEnv.padEnd(42)}║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║   ENDPOINTS                                              ║
║                                                          ║
║   Auth:                                                  ║
║   ├─ POST   /api/auth/register                           ║
║   ├─ POST   /api/auth/login                              ║
║   ├─ POST   /api/auth/refresh                            ║
║   ├─ POST   /api/auth/logout                             ║
║   ├─ GET    /api/auth/me                                 ║
║   ├─ PATCH  /api/auth/me                                 ║
║   ├─ POST   /api/auth/change-password                    ║
║   └─ DELETE /api/auth/me                                 ║
║                                                          ║
║   Maps:                                                  ║
║   ├─ POST   /api/projects/:id/maps (upload)              ║
║   ├─ GET    /api/projects/:id/maps                       ║
║   ├─ GET    /api/projects/:id/maps/stats                 ║
║   ├─ GET    /api/maps/:id                                ║
║   ├─ GET    /api/maps/:id/download                       ║
║   ├─ PATCH  /api/maps/:id                                ║
║   └─ DELETE /api/maps/:id                                ║
║                                                          ║
║   Measurements:                                          ║
║   ├─ POST   /api/maps/:id/measurements                   ║
║   ├─ GET    /api/maps/:id/measurements                   ║
║   ├─ GET    /api/projects/:id/measurements               ║
║   ├─ GET    /api/projects/:id/measurements/totals        ║
║   ├─ GET    /api/measurements/:id                        ║
║   ├─ PATCH  /api/measurements/:id                        ║
║   └─ DELETE /api/measurements/:id                        ║
║                                                          ║
║   Industrial:                                            ║
║   ├─ GET    /api/industrial                              ║
║   ├─ GET    /api/industrial/stats                        ║
║   ├─ GET    /api/industrial/:id                          ║
║   ├─ GET    /api/properties/:id/industrial               ║
║   ├─ POST   /api/industrial                              ║
║   ├─ PATCH  /api/industrial/:id                          ║
║   └─ DELETE /api/industrial/:id                          ║
║                                                          ║
║   Health:                                                ║
║   └─ GET    /api/health                                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
