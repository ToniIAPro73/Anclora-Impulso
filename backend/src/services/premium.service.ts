import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import type { CreateFormAnalysisInput, CreateVoiceCuesInput } from '../utils/validators';

const FORM_ANALYSIS_DISCLAIMER =
  'This form analysis is informational only. It is not medical advice, diagnosis, or a substitute for an in-person qualified coach.';

const VOICE_COACH_DISCLAIMER =
  'Voice coaching cues are not medical advice. Stop if you feel pain, dizziness, or unsafe movement.';

function isPremiumTier(subscriptionTier: string | null | undefined) {
  return subscriptionTier === 'premium' || subscriptionTier === 'pro';
}

async function getUserEntitlement(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return {
    subscriptionTier: user.subscriptionTier,
    premiumEntitled: isPremiumTier(user.subscriptionTier),
  };
}

function requirePremium(premiumEntitled: boolean) {
  if (!premiumEntitled) {
    throw new AppError(403, 'Premium subscription required');
  }
}

function requireFlag(enabled: boolean, featureName: string) {
  if (!enabled) {
    throw new AppError(403, `${featureName} is disabled`);
  }
}

export async function getPremiumStatus(userId: string) {
  const entitlement = await getUserEntitlement(userId);

  return {
    ...entitlement,
    features: {
      formAnalysis: {
        enabled: env.formAnalysisEnabled,
        available: env.formAnalysisEnabled && entitlement.premiumEntitled,
        mode: 'async_contract',
      },
      voiceCoach: {
        enabled: env.voiceCoachEnabled,
        available: env.voiceCoachEnabled && entitlement.premiumEntitled,
        mode: 'script_only',
      },
    },
  };
}

function buildFormFeedback(input: CreateFormAnalysisInput) {
  const signals = Array.isArray(input.clientAnalysis?.signals)
    ? input.clientAnalysis.signals.map(String)
    : [];

  const feedback = ['Keep the bar close and brace before each rep.'];

  if (signals.includes('hips_rising_early')) {
    feedback.push('Slow the first pull and keep hips and chest rising together.');
  }

  if (signals.includes('bar_path_forward')) {
    feedback.push('Aim for a more vertical bar path over mid-foot.');
  }

  feedback.push('Review the clip with a qualified coach before changing technique under heavy load.');

  return [...new Set(feedback)].slice(0, 4);
}

export async function createFormAnalysis(userId: string, input: CreateFormAnalysisInput) {
  const entitlement = await getUserEntitlement(userId);
  requireFlag(env.formAnalysisEnabled, 'Form analysis');
  requirePremium(entitlement.premiumEntitled);

  return prisma.formAnalysisRequest.create({
    data: {
      userId,
      exerciseName: input.exerciseName,
      mediaType: input.mediaType,
      mediaUrl: input.mediaUrl,
      status: 'queued',
      feedback: buildFormFeedback(input),
      disclaimer: FORM_ANALYSIS_DISCLAIMER,
      clientAnalysis: input.clientAnalysis as Prisma.InputJsonValue | undefined,
    },
  });
}

function buildVoiceCues(input: CreateVoiceCuesInput) {
  const cues = [`Brace, set your shoulders, and control the first rep.`];

  if (input.phase === 'warmup') {
    cues.push('Warm-up set: move smoothly and save effort for the work ahead.');
  } else if (input.phase === 'rest') {
    cues.push('Rest, breathe through your nose, and prepare the next setup.');
  } else if (input.intensity === 'hard') {
    cues.push('Hard set: keep one rep in reserve and stop if form breaks.');
  } else {
    cues.push('Stay controlled and keep the tempo consistent.');
  }

  cues.push('Breathe, finish clean, then rack with control.');

  return cues;
}

export async function createVoiceCues(userId: string, input: CreateVoiceCuesInput) {
  const entitlement = await getUserEntitlement(userId);
  requireFlag(env.voiceCoachEnabled, 'Voice coach');
  requirePremium(entitlement.premiumEntitled);

  return prisma.voiceCueSession.create({
    data: {
      userId,
      workoutSessionId: input.workoutSessionId,
      exerciseName: input.exerciseName,
      phase: input.phase,
      intensity: input.intensity,
      locale: input.locale,
      provider: 'deterministic',
      audioStatus: 'script_only',
      cues: buildVoiceCues(input),
      disclaimer: VOICE_COACH_DISCLAIMER,
    },
  });
}
