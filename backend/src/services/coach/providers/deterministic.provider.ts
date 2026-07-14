import type { CoachProvider, CoachProviderRequest, CoachProviderResponse } from '../types';

let providerCalls = 0;

export function resetDeterministicCoachProviderCalls() {
  providerCalls = 0;
}

export function getDeterministicCoachProviderCalls() {
  return providerCalls;
}

function extractContext(messages: CoachProviderRequest['messages']) {
  const systemMessage = messages.find((message) => message.role === 'system')?.content ?? '';
  const goalMatch = systemMessage.match(/trainingGoal=([^;\n]+)/);
  const limitationsMatch = systemMessage.match(/limitations=([^;\n]+)/);

  return {
    goal: goalMatch?.[1] ?? 'unknown',
    limitations: limitationsMatch?.[1] ?? 'none',
  };
}

export const deterministicCoachProvider: CoachProvider = {
  name: 'deterministic',
  async complete(request: CoachProviderRequest): Promise<CoachProviderResponse> {
    providerCalls += 1;
    const { goal, limitations } = extractContext(request.messages);

    return {
      answer: `Context-aware coaching: trainingGoal=${goal}; limitations=${limitations}. Keep the next action simple, measurable, and recovery-aware.`,
      provider: 'deterministic',
      model: 'deterministic-local',
      estimatedOutputTokens: 28,
    };
  },
};
