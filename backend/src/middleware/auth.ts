import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware para verificar autenticación
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const payload = verifyAccessToken(token);
    
    // Agregar usuario al request
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expirado' });
      return;
    }
    
    res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
    
    next();
  } catch (error) {
    // Ignorar errores y continuar sin usuario
    next();
  }
}
