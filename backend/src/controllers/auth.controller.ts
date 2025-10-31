import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt';
import type { RegisterInput, LoginInput } from '../utils/validators';

/**
 * POST /api/auth/register
 */
export async function register(
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.register(req.body);
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 */
export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const user = await authService.getCurrentUser(req.user.userId);
    
    res.json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token requerido' });
      return;
    }

    // Verificar refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Generar nuevo access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(
  req: Request,
  res: Response
): Promise<void> {
  // En una implementación con tokens en cookies, aquí se limpiarían
  // Como usamos tokens en el cliente, solo enviamos confirmación
  res.json({ message: 'Sesión cerrada exitosamente' });
}
