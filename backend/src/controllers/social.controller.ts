import { Request, Response, NextFunction } from 'express';
import * as socialService from '../services/social.service';
import type { UpdateSocialPrivacyInput } from '../utils/validators';

function requireUserId(req: Request) {
  if (!req.user) {
    return null;
  }

  return req.user.userId;
}

export async function updatePrivacy(
  req: Request<{}, {}, UpdateSocialPrivacyInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await socialService.updatePrivacy(userId, req.body.visibility);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function followUser(req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const follow = await socialService.followUser(userId, req.params.userId);
    res.status(201).json(follow);
  } catch (error) {
    next(error);
  }
}

export async function unfollowUser(req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await socialService.unfollowUser(userId, req.params.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const feed = await socialService.getFeed(userId);
    res.json(feed);
  } catch (error) {
    next(error);
  }
}

export async function addKudos(req: Request<{ feedItemId: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const kudos = await socialService.addKudos(userId, req.params.feedItemId);
    res.status(201).json(kudos);
  } catch (error) {
    next(error);
  }
}

export async function removeKudos(req: Request<{ feedItemId: string }>, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await socialService.removeKudos(userId, req.params.feedItemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getWeeklyChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const challenge = await socialService.ensureWeeklyChallenge();
    res.json(challenge);
  } catch (error) {
    next(error);
  }
}

export async function joinChallenge(
  req: Request<{ challengeId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const participant = await socialService.joinChallenge(userId, req.params.challengeId);
    res.status(201).json(participant);
  } catch (error) {
    next(error);
  }
}

export async function getChallengeLeaderboard(
  req: Request<{ challengeId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const leaderboard = await socialService.getChallengeLeaderboard(req.params.challengeId);
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
}
