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
