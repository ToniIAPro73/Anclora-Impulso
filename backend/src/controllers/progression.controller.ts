import { Request, Response, NextFunction } from 'express';
import * as progressionService from '../services/progression/progression.service';
import type { GenerateNextSessionInput } from '../services/progression/progression.service';

export async function generateNextSession(
  req: Request<{}, {}, GenerateNextSessionInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const plan = await progressionService.generateNextSession(req.user.userId, req.body);

    res.json(plan);
  } catch (error) {
    next(error);
  }
}
