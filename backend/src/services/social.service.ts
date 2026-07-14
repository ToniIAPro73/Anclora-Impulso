import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

type SocialVisibility = 'public' | 'private';

function startOfWeek(date: Date) {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = result.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setUTCDate(result.getUTCDate() + diff);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function weekKey(date: Date) {
  const start = startOfWeek(date);
  return `weekly-workouts-${start.toISOString().slice(0, 10)}`;
}

async function getVisibleAuthorIds(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  return [userId, ...follows.map((follow) => follow.followingId)];
}

export async function updatePrivacy(userId: string, visibility: SocialVisibility) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { socialProfileVisibility: visibility },
    select: {
      id: true,
      socialProfileVisibility: true,
    },
  });

  return {
    userId: user.id,
    visibility: user.socialProfileVisibility,
  };
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new AppError(400, 'Users cannot follow themselves');
  }

  const target = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true },
  });

  if (!target) {
    throw new AppError(404, 'User to follow not found');
  }

  return prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
    update: {},
    create: {
      followerId,
      followingId,
    },
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  await prisma.follow.deleteMany({
    where: {
      followerId,
      followingId,
    },
  });
}

export async function getFeed(userId: string) {
  const visibleAuthorIds = await getVisibleAuthorIds(userId);
  const items = await prisma.activityFeedItem.findMany({
    where: {
      OR: [
        { visibility: 'public' },
        {
          userId: {
            in: visibleAuthorIds,
          },
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          socialProfileVisibility: true,
        },
      },
      kudos: {
        select: {
          userId: true,
        },
      },
    },
  });

  return {
    items: items
      .filter((item) => item.visibility === 'public' || visibleAuthorIds.includes(item.userId))
      .map((item) => ({
        id: item.id,
        userId: item.userId,
        userName: item.user.fullName,
        type: item.type,
        content: item.content,
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        visibility: item.visibility,
        metadata: item.metadata,
        createdAt: item.createdAt,
        kudosCount: item.kudos.length,
        hasKudosFromMe: item.kudos.some((kudos) => kudos.userId === userId),
      })),
  };
}

async function assertFeedItemVisible(userId: string, feedItemId: string) {
  const feedItem = await prisma.activityFeedItem.findUnique({
    where: { id: feedItemId },
    select: {
      id: true,
      userId: true,
      visibility: true,
    },
  });

  if (!feedItem) {
    throw new AppError(404, 'Feed item not found');
  }

  if (feedItem.visibility === 'public' || feedItem.userId === userId) {
    return feedItem;
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: feedItem.userId,
      },
    },
  });

  if (!follow) {
    throw new AppError(404, 'Feed item not found');
  }

  return feedItem;
}

export async function addKudos(userId: string, feedItemId: string) {
  await assertFeedItemVisible(userId, feedItemId);

  return prisma.kudos.upsert({
    where: {
      userId_feedItemId: {
        userId,
        feedItemId,
      },
    },
    update: {},
    create: {
      userId,
      feedItemId,
    },
  });
}

export async function removeKudos(userId: string, feedItemId: string) {
  await prisma.kudos.deleteMany({
    where: {
      userId,
      feedItemId,
    },
  });
}

export async function ensureWeeklyChallenge(now = new Date()) {
  const startsAt = startOfWeek(now);
  const endsAt = addDays(startsAt, 7);
  const key = weekKey(now);

  return prisma.challenge.upsert({
    where: { key },
    update: {},
    create: {
      key,
      title: 'Weekly Consistency Challenge',
      metric: 'workout_completions',
      startsAt,
      endsAt,
    },
  });
}

export async function joinChallenge(userId: string, challengeId: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true },
  });

  if (!challenge) {
    throw new AppError(404, 'Challenge not found');
  }

  return prisma.challengeParticipant.upsert({
    where: {
      challengeId_userId: {
        challengeId,
        userId,
      },
    },
    update: {},
    create: {
      challengeId,
      userId,
    },
  });
}

export async function getChallengeLeaderboard(challengeId: string) {
  const participants = await prisma.challengeParticipant.findMany({
    where: { challengeId },
    orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return {
    entries: participants.map((participant, index) => ({
      rank: index + 1,
      userId: participant.userId,
      userName: participant.user.fullName,
      score: participant.score,
      joinedAt: participant.joinedAt,
    })),
  };
}

export async function recordWorkoutCompletedActivity(params: {
  userId: string;
  sessionId: string;
  workoutName: string;
  durationSeconds: number;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { socialProfileVisibility: true },
  });

  const visibility = user?.socialProfileVisibility === 'private' ? 'private' : 'public';

  await prisma.activityFeedItem.create({
    data: {
      userId: params.userId,
      type: 'workout_completed',
      content: `Completed ${params.workoutName}`,
      sourceType: 'workout_session',
      sourceId: params.sessionId,
      visibility,
      metadata: {
        durationSeconds: params.durationSeconds,
      },
    },
  });

  const challenge = await ensureWeeklyChallenge();
  await prisma.challengeParticipant.updateMany({
    where: {
      challengeId: challenge.id,
      userId: params.userId,
    },
    data: {
      score: {
        increment: 1,
      },
    },
  });
}
