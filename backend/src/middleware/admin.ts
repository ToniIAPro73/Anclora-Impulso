import { type Request, type Response, type NextFunction } from 'express';
import { env } from '../config/env';

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return env.adminEmails.includes(email.trim().toLowerCase());
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.email || !isAdminEmail(req.user.email)) {
    res.status(403).json({ error: 'Acceso restringido a administradores' });
    return;
  }

  next();
}
