import { env } from '../../../config/env';
import type { CoachProvider } from '../types';
import { deterministicCoachProvider } from './deterministic.provider';
import { GroqCoachProvider } from './groq.provider';

export function getCoachProvider(): CoachProvider {
  if (env.llmProvider === 'deterministic') {
    return deterministicCoachProvider;
  }

  return new GroqCoachProvider();
}
