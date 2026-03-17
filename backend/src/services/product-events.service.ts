import { prisma } from '../config/database';
import type { CreateProductEventInput } from '../utils/validators';

export async function trackProductEvent(userId: string | null, input: CreateProductEventInput) {
  return prisma.productEvent.create({
    data: {
      userId,
      action: input.action,
      category: input.category,
      source: input.source,
      metadata: input.metadata,
    },
  });
}

export async function getProductEventsSummary() {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const twentyEightDaysAgo = new Date(now);
  twentyEightDaysAgo.setDate(now.getDate() - 28);

  const [last7Days, last28Days, topActions, topSources] = await Promise.all([
    prisma.productEvent.groupBy({
      by: ['action'],
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    }),
    prisma.productEvent.count({
      where: {
        createdAt: { gte: twentyEightDaysAgo },
      },
    }),
    prisma.productEvent.groupBy({
      by: ['action', 'category'],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
      take: 10,
    }),
    prisma.productEvent.groupBy({
      by: ['source'],
      where: {
        source: {
          not: null,
        },
      },
      _count: {
        source: true,
      },
      orderBy: {
        _count: {
          source: 'desc',
        },
      },
      take: 8,
    }),
  ]);

  return {
    totalLast28Days: last28Days,
    last7Days: last7Days.map((item) => ({
      action: item.action,
      count: item._count.action,
    })),
    topActions: topActions.map((item) => ({
      action: item.action,
      category: item.category,
      count: item._count.action,
    })),
    topSources: topSources.map((item) => ({
      source: item.source,
      count: item._count.source,
    })),
  };
}
