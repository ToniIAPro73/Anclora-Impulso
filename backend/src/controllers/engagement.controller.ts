import { Request, Response, NextFunction } from 'express';
import * as engagementService from '../services/engagement.service';

export async function getUserNudges(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const response = await engagementService.getUserNudges(req.user.userId);
    res.json(response);
  } catch (error) {
    next(error);
  }
}
