import { Request, Response } from 'express';
import {
  getSystemMetrics,
  getDatabaseMetrics,
  getLogStats,
  getRecentLogs,
  getMetricsSummary,
} from '../services/metrics.service';
import logger from '../config/logger';

// Obtener métricas del sistema
export const getMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = getSystemMetrics();
    res.json(metrics);
  } catch (error: any) {
    logger.error('Error getting system metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get system metrics' });
  }
};

// Obtener métricas de la base de datos
export const getDbMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = await getDatabaseMetrics();
    res.json(metrics);
  } catch (error: any) {
    logger.error('Error getting database metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get database metrics' });
  }
};

// Obtener estadísticas de logs
export const getLogsStats = async (req: Request, res: Response) => {
  try {
    const stats = await getLogStats();
    res.json(stats);
  } catch (error: any) {
    logger.error('Error getting log stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get log stats' });
  }
};

// Obtener logs recientes
export const getLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const level = req.query.level as string | undefined;
    
    const logs = await getRecentLogs(limit, level);
    res.json(logs);
  } catch (error: any) {
    logger.error('Error getting recent logs', { error: error.message });
    res.status(500).json({ error: 'Failed to get recent logs' });
  }
};

// Obtener resumen completo de métricas
export const getSummary = async (req: Request, res: Response) => {
  try {
    const summary = await getMetricsSummary();
    res.json(summary);
  } catch (error: any) {
    logger.error('Error getting metrics summary', { error: error.message });
    res.status(500).json({ error: 'Failed to get metrics summary' });
  }
};
