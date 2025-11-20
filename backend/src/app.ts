import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { httpLogger, responseTimeLogger } from './middleware/httpLogger';
import { incrementRequestCount } from './services/health.service';
import { incrementRequestCounter } from './services/metrics.service';
import logger from './config/logger';

// Importar rutas
import authRoutes from './routes/auth.routes';
import exercisesRoutes from './routes/exercises.routes';
import workoutsRoutes from './routes/workouts.routes';
import sessionsRoutes from './routes/sessions.routes';
import progressRoutes from './routes/progress.routes';
import healthRoutes from './routes/health.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos (dashboard)
app.use('/dashboard', express.static('public'));

// Logging middleware
app.use(responseTimeLogger);
app.use(httpLogger);

// Contador de requests para métricas
app.use((req, res, next) => {
  incrementRequestCount();
  incrementRequestCounter();
  next();
});

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: 'Demasiadas solicitudes, por favor intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: 'Demasiados intentos de autenticación, por favor intenta más tarde',
  skipSuccessfulRequests: true,
});

// Rutas de health check
app.use('/', healthRoutes);

// Log de inicio de aplicación
logger.info('Application initialized', {
  environment: env.nodeEnv,
  port: env.port,
});

// Rutas de la API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejo global de errores
app.use(errorHandler);

export default app;
