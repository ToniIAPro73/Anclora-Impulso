import { Request, Response, NextFunction } from 'express';
import * as coachService from '../services/coach/coach.service';
import type { SendCoachMessageInput } from '../utils/validators';

export async function sendMessage(
  req: Request<{}, {}, SendCoachMessageInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const response = await coachService.sendCoachMessage(req.user.userId, req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
}
