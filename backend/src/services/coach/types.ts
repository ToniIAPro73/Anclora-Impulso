export type CoachRole = 'system' | 'user' | 'assistant';

export interface CoachChatMessage {
  role: CoachRole;
  content: string;
}

export interface CoachProviderRequest {
  messages: CoachChatMessage[];
  maxOutputTokens: number;
}

export interface CoachProviderResponse {
  answer: string;
  provider: string;
  model: string;
  estimatedOutputTokens: number;
}

export interface CoachProvider {
  name: string;
  complete(request: CoachProviderRequest): Promise<CoachProviderResponse>;
}

export interface CoachSafetyResult {
  withinScope: boolean;
  escalatedToProfessional: boolean;
  flags: string[];
  directAnswer?: string;
}

export interface CoachResponse {
  conversationId: string;
  answer: string;
  provider: string;
  model: string;
  cached: boolean;
  safety: CoachSafetyResult;
  usage: {
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
    estimatedTotalTokens: number;
    remainingWindowRequests: number;
  };
}
