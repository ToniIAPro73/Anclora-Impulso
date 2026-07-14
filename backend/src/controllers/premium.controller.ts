import { Request, Response, NextFunction } from 'express';
import * as premiumService from '../services/premium.service';
import type { CreateFormAnalysisInput, CreateVoiceCuesInput } from '../utils/validators';

export async function getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const status = await premiumService.getPremiumStatus(req.user.userId);

    res.json(status);
  } catch (error) {
    next(error);
  }
}

export async function createFormAnalysis(
  req: Request<{}, {}, CreateFormAnalysisInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const analysis = await premiumService.createFormAnalysis(req.user.userId, req.body);

    res.status(201).json(analysis);
  } catch (error) {
    next(error);
  }
}

export async function createVoiceCues(
  req: Request<{}, {}, CreateVoiceCuesInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const voiceCues = await premiumService.createVoiceCues(req.user.userId, req.body);

    res.status(201).json(voiceCues);
  } catch (error) {
    next(error);
  }
}
