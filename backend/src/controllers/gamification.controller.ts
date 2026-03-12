import { Request, Response, NextFunction } from 'express';
import * as gamificationService from '../services/gamification.service';

/**
 * GET /api/gamification/status
 */
export async function getStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const status = await gamificationService.getOrCreateGamification(req.user.userId);
    res.json(status);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/gamification/achievements
 */
export async function getAchievements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const achievements = await gamificationService.getUserAchievements(req.user.userId);
    res.json(achievements);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/gamification/xp-history
 */
export async function getXPHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const history = await gamificationService.getXPHistory(req.user.userId, limit);
    res.json(history);
  } catch (error) {
    next(error);
  }
}
