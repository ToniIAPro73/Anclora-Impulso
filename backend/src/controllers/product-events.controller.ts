import { type NextFunction, type Request, type Response } from 'express';
import * as productEventsService from '../services/product-events.service';
import type { CreateProductEventInput } from '../utils/validators';

export async function createProductEvent(
  req: Request<{}, {}, CreateProductEventInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const event = await productEventsService.trackProductEvent(req.user?.userId ?? null, req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
}

export async function getProductEventsSummary(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const summary = await productEventsService.getProductEventsSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
}
