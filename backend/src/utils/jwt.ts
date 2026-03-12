import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generar un token de acceso JWT
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload as jwt.JwtPayload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
}

/**
 * Generar un token de refresco JWT
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload as jwt.JwtPayload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } as SignOptions);
}

/**
 * Verificar y decodificar un token de acceso
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

/**
 * Verificar y decodificar un token de refresco
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
}
