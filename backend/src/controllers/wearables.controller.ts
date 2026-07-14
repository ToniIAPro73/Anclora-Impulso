import { Request, Response, NextFunction } from 'express';
import * as wearablesService from '../services/wearables.service';
import type { CreateRecoverySampleInput, UpsertWearableConnectionInput } from '../utils/validators';

export async function getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.json(wearablesService.getWearableStatus());
  } catch (error) {
    next(error);
  }
}

export async function upsertConnection(
  req: Request<{ provider: string }, {}, UpsertWearableConnectionInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const connection = await wearablesService.upsertConnection(req.user.userId, req.params.provider, req.body);

    res.json(connection);
  } catch (error) {
    next(error);
  }
}

export async function createRecoverySample(
  req: Request<{}, {}, CreateRecoverySampleInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const sample = await wearablesService.createRecoverySample(req.user.userId, req.body);

    res.status(201).json(sample);
  } catch (error) {
    next(error);
  }
}

export async function getReadiness(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const readiness = await wearablesService.getLatestReadiness(req.user.userId);

    res.json(readiness);
  } catch (error) {
    next(error);
  }
}
