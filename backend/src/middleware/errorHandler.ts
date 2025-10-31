import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger, { logError } from '../config/logger';

/**
 * Clase de error personalizado
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Middleware global de manejo de errores
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Contexto del error
  const errorContext = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
    body: req.body,
    params: req.params,
    query: req.query,
  };

  // Loguear el error
  logError(err, errorContext);

  // Error personalizado de la aplicación
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Violación de constraint único
    if (err.code === 'P2002') {
      res.status(409).json({
        error: 'Ya existe un registro con esos datos',
      });
      return;
    }

    // Registro no encontrado
    if (err.code === 'P2025') {
      res.status(404).json({
        error: 'Registro no encontrado',
      });
      return;
    }

    // Foreign key constraint failed
    if (err.code === 'P2003') {
      res.status(400).json({
        error: 'Referencia inválida',
      });
      return;
    }
  }

  // Error de validación de Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      error: 'Datos inválidos',
    });
    return;
  }

  // Error genérico
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Error interno del servidor',
  });
}

/**
 * Middleware para rutas no encontradas
 */
export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  
  res.status(404).json({
    error: 'Ruta no encontrada',
  });
}
