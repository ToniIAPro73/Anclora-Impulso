import { Request, Response } from 'express';
import { getHealthStatus, getSimpleHealthStatus } from '../services/health.service';
import logger from '../config/logger';

// Health check detallado
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const healthStatus = await getHealthStatus();
    
    // Retornar código de status apropiado
    const statusCode = 
      healthStatus.status === 'healthy' ? 200 :
      healthStatus.status === 'degraded' ? 200 :
      503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error: any) {
    logger.error('Health check endpoint error', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
    });
  }
};

// Health check simple (para load balancers)
export const simpleHealthCheck = async (req: Request, res: Response) => {
  try {
    const status = await getSimpleHealthStatus();
    
    if (status.status === 'ok') {
      res.status(200).json(status);
    } else {
      res.status(503).json(status);
    }
  } catch (error: any) {
    logger.error('Simple health check endpoint error', { error: error.message });
    res.status(503).json({ status: 'error' });
  }
};

// Endpoint de readiness (para Kubernetes)
export const readinessCheck = async (req: Request, res: Response) => {
  try {
    const healthStatus = await getHealthStatus();
    
    // Ready si no está unhealthy
    if (healthStatus.status !== 'unhealthy') {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false });
    }
  } catch (error: any) {
    logger.error('Readiness check error', { error: error.message });
    res.status(503).json({ ready: false });
  }
};

// Endpoint de liveness (para Kubernetes)
export const livenessCheck = (req: Request, res: Response) => {
  // Si el servidor responde, está "alive"
  res.status(200).json({ alive: true });
};
