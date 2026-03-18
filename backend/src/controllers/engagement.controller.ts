import { Request, Response, NextFunction } from 'express';
import * as engagementService from '../services/engagement.service';
import * as notificationService from '../services/notification.service';

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

export async function getUserNotificationHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const deliveries = await notificationService.getUserDeliveries(req.user.userId);
    res.json(deliveries);
  } catch (error) {
    next(error);
  }
}

export async function dispatchNotificationsNow(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await notificationService.dispatchDueNotifications();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getRecentNotificationDeliveries(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deliveries = await notificationService.getRecentDeliveries();
    res.json(deliveries);
  } catch (error) {
    next(error);
  }
}
