import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors'; // Handle async errors automatically

import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';

// ============================================
// Create Express Application
// ============================================

const app = express();

// ============================================
// Security Middleware
// ============================================

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: config.cors.origins,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ============================================
// Request Parsing
// ============================================

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Logging
// ============================================

// HTTP request logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// API Routes
// ============================================

// Mount all routes under /api
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
  });
});

// ============================================
// Error Handling
// ============================================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
