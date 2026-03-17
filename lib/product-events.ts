"use client"

import { eventsApi } from "@/lib/api";

export async function trackProductEvent(input: {
  action: string;
  category: string;
  source?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await eventsApi.track(input);
  } catch {
    // Telemetry must never break product flows.
  }
}

export function buildDismissedNudgeKey(userId: string, nudgeId: string, dateKey?: string) {
  const key = dateKey ?? new Date().toISOString().slice(0, 10)
  return `anclora-dismissed-nudge:${userId}:${key}:${nudgeId}`
}
