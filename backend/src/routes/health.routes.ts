import { Router, type Router as ExpressRouter } from 'express';
import {
  healthCheck,
  simpleHealthCheck,
  readinessCheck,
  livenessCheck,
} from '../controllers/health.controller';

const router: ExpressRouter = Router();

/**
 * @route   GET /health
 * @desc    Health check detallado con métricas
 * @access  Public
 */
router.get('/health', healthCheck);

/**
 * @route   GET /health/simple
 * @desc    Health check simple (para load balancers)
 * @access  Public
 */
router.get('/health/simple', simpleHealthCheck);

/**
 * @route   GET /health/ready
 * @desc    Readiness probe (para Kubernetes)
 * @access  Public
 */
router.get('/health/ready', readinessCheck);

/**
 * @route   GET /health/live
 * @desc    Liveness probe (para Kubernetes)
 * @access  Public
 */
router.get('/health/live', livenessCheck);

export default router;
