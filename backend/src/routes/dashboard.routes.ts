import { Router } from 'express';
import {
  getMetrics,
  getDbMetrics,
  getLogsStats,
  getLogs,
  getSummary,
} from '../controllers/dashboard.controller';

const router = Router();

/**
 * @route   GET /api/dashboard/metrics
 * @desc    Obtener métricas del sistema
 * @access  Public (en producción, proteger con autenticación)
 */
router.get('/metrics', getMetrics);

/**
 * @route   GET /api/dashboard/db-metrics
 * @desc    Obtener métricas de la base de datos
 * @access  Public (en producción, proteger con autenticación)
 */
router.get('/db-metrics', getDbMetrics);

/**
 * @route   GET /api/dashboard/logs-stats
 * @desc    Obtener estadísticas de logs
 * @access  Public (en producción, proteger con autenticación)
 */
router.get('/logs-stats', getLogsStats);

/**
 * @route   GET /api/dashboard/logs
 * @desc    Obtener logs recientes
 * @query   limit - Número de logs a obtener (default: 100)
 * @query   level - Filtrar por nivel (error, warn, info, http)
 * @access  Public (en producción, proteger con autenticación)
 */
router.get('/logs', getLogs);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Obtener resumen completo de métricas
 * @access  Public (en producción, proteger con autenticación)
 */
router.get('/summary', getSummary);

export default router;
