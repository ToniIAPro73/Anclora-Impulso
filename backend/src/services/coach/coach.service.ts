import crypto from 'crypto';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { buildCoachContext } from './context';
import { evaluateCoachSafety } from './guardrails';
import { getCoachProvider } from './providers';
import type { CoachChatMessage, CoachResponse } from './types';

interface SendCoachMessageInput {
  conversationId?: string;
  message: string;
}

interface CacheEntry {
  expiresAt: number;
  response: CoachResponse;
}

const responseCache = new Map<string, CacheEntry>();

export function resetCoachRuntimeState() {
  responseCache.clear();
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function getWindowStart(now: Date) {
  const windowMs = env.llmCoachWindowMinutes * 60 * 1000;
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

function hashCacheKey(parts: string[]) {
  return crypto.createHash('sha256').update(parts.join('\n---\n')).digest('hex');
}

function trimPrompt(text: string) {
  if (text.length <= env.llmCoachMaxPromptChars) {
    return text;
  }

  return text.slice(0, env.llmCoachMaxPromptChars);
}

async function resolveConversation(userId: string, conversationId?: string) {
  if (conversationId) {
    const existing = await prisma.coachConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'Coach conversation not found');
    }

    return existing;
  }

  const latest = await prisma.coachConversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  if (latest) {
    return latest;
  }

  return prisma.coachConversation.create({
    data: {
      userId,
      title: 'Coach conversation',
    },
  });
}

async function loadBoundedMemory(conversationId: string): Promise<CoachChatMessage[]> {
  const messages = await prisma.coachMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: env.llmCoachMemoryMessages,
  });

  return messages
    .reverse()
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content,
    }));
}

async function checkAndIncrementUsage(userId: string, tokenEstimate: number, now: Date) {
  const windowStartsAt = getWindowStart(now);
  const current = await prisma.coachUsageWindow.upsert({
    where: {
      userId_windowStartsAt: {
        userId,
        windowStartsAt,
      },
    },
    update: {},
    create: {
      userId,
      windowStartsAt,
    },
  });

  if (current.requestCount >= env.llmCoachWindowLimit) {
    throw new AppError(429, 'LLM coach rate limit exceeded');
  }

  const updated = await prisma.coachUsageWindow.update({
    where: { id: current.id },
    data: {
      requestCount: { increment: 1 },
      tokenEstimate: { increment: tokenEstimate },
    },
  });

  return Math.max(0, env.llmCoachWindowLimit - updated.requestCount);
}

async function persistExchange(params: {
  conversationId: string;
  userMessage: string;
  answer: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  safetyFlags: string[];
}) {
  await prisma.$transaction([
    prisma.coachMessage.create({
      data: {
        conversationId: params.conversationId,
        role: 'user',
        content: params.userMessage,
        estimatedTokens: params.inputTokens,
        safetyFlags: params.safetyFlags,
      },
    }),
    prisma.coachMessage.create({
      data: {
        conversationId: params.conversationId,
        role: 'assistant',
        content: params.answer,
        provider: params.provider,
        model: params.model,
        estimatedTokens: params.outputTokens,
        safetyFlags: params.safetyFlags,
      },
    }),
    prisma.coachConversation.update({
      where: { id: params.conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
}

export async function sendCoachMessage(userId: string, input: SendCoachMessageInput): Promise<CoachResponse> {
  if (!env.llmCoachEnabled) {
    throw new AppError(503, 'LLM coach is disabled');
  }

  const now = new Date();
  const conversation = await resolveConversation(userId, input.conversationId);
  const safety = evaluateCoachSafety(input.message);
  const context = await buildCoachContext(userId);
  const memory = await loadBoundedMemory(conversation.id);
  const systemPrompt = trimPrompt([
    'You are Anclora Impulso Coach.',
    'Stay inside fitness, training, recovery, adherence, and general nutrition habits.',
    'Do not provide medical diagnosis. For pain, injury, or symptoms, direct the user to a qualified professional.',
    'Give concise, practical, measurable advice.',
    context,
  ].join('\n'));
  const inputTokens = estimateTokens(`${systemPrompt}\n${memory.map((message) => message.content).join('\n')}\n${input.message}`);

  if (safety.directAnswer) {
    const remainingWindowRequests = await checkAndIncrementUsage(userId, inputTokens, now);
    const outputTokens = estimateTokens(safety.directAnswer);
    await persistExchange({
      conversationId: conversation.id,
      userMessage: input.message,
      answer: safety.directAnswer,
      provider: 'guardrail',
      model: 'rule-based',
      inputTokens,
      outputTokens,
      safetyFlags: safety.flags,
    });

    return {
      conversationId: conversation.id,
      answer: safety.directAnswer,
      provider: 'guardrail',
      model: 'rule-based',
      cached: false,
      safety,
      usage: {
        estimatedInputTokens: inputTokens,
        estimatedOutputTokens: outputTokens,
        estimatedTotalTokens: inputTokens + outputTokens,
        remainingWindowRequests,
      },
    };
  }

  const cacheKey = hashCacheKey([userId, conversation.id, input.message, context]);
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > now.getTime()) {
    return {
      ...cached.response,
      cached: true,
    };
  }

  const remainingWindowRequests = await checkAndIncrementUsage(userId, inputTokens, now);
  const provider = getCoachProvider();
  const providerResponse = await provider.complete({
    maxOutputTokens: env.llmCoachMaxOutputTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...memory,
      { role: 'user', content: input.message },
    ],
  });
  const outputTokens = providerResponse.estimatedOutputTokens;

  await persistExchange({
    conversationId: conversation.id,
    userMessage: input.message,
    answer: providerResponse.answer,
    provider: providerResponse.provider,
    model: providerResponse.model,
    inputTokens,
    outputTokens,
    safetyFlags: safety.flags,
  });

  const response: CoachResponse = {
    conversationId: conversation.id,
    answer: providerResponse.answer,
    provider: providerResponse.provider,
    model: providerResponse.model,
    cached: false,
    safety,
    usage: {
      estimatedInputTokens: inputTokens,
      estimatedOutputTokens: outputTokens,
      estimatedTotalTokens: inputTokens + outputTokens,
      remainingWindowRequests,
    },
  };

  if (env.llmCoachCacheTtlSeconds > 0) {
    responseCache.set(cacheKey, {
      expiresAt: now.getTime() + env.llmCoachCacheTtlSeconds * 1000,
      response,
    });
  }

  return response;
}
