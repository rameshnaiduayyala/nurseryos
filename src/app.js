import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { rateLimit } from 'express-rate-limit';

import apiRouter from './common/routes.js';
import swaggerSpec from './config/swagger.js';
import { errorHandler } from './common/middleware/error.middleware.js';
import ApiError from './common/helpers/api-error.js';
import logger from './config/logger.js';
import { startReservationDaemon } from './common/helpers/reservation-daemon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Rate Limiters
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100;
const RATE_LIMIT_AUTH_WINDOW_MS = parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000;
const RATE_LIMIT_AUTH_MAX = parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 20;

const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_AUTH_WINDOW_MS,
  max: RATE_LIMIT_AUTH_MAX,
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Boot Background Daemon
startReservationDaemon();

// Security Middlewares
app.use(helmet());
app.use(cors());
if (process.env.NODE_ENV !== 'development') {
  app.use('/api', globalLimiter);
  app.use('/api/auth', authLimiter);
}

// Optimization Middlewares
app.use(compression());

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Serve Local File Storage Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base status route
app.get('/status', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mount Application Routes
app.use('/api', apiRouter);

// 404 handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
