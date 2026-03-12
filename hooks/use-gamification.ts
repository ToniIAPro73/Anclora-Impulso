import { useQuery } from '@tanstack/react-query';
import { gamificationApi, type GamificationStatus, type Achievement, type XPEvent } from '@/lib/api';

export function useGamificationStatus() {
  return useQuery<GamificationStatus>({
    queryKey: ['gamificationStatus'],
    queryFn: () => gamificationApi.getStatus(),
    staleTime: 60 * 1000, // 1 minuto
  });
}

export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: () => gamificationApi.getAchievements(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useXPHistory(limit = 20) {
  return useQuery<XPEvent[]>({
    queryKey: ['xpHistory', limit],
    queryFn: () => gamificationApi.getXPHistory(limit),
    staleTime: 2 * 60 * 1000,
  });
}
