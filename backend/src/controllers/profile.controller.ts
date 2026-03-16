import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service';
import type { UpdateUserProfileInput } from '../services/profile.service';

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const profile = await profileService.getUserProfile(req.user.userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: Request<{}, {}, UpdateUserProfileInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const profile = await profileService.updateUserProfile(req.user.userId, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}
