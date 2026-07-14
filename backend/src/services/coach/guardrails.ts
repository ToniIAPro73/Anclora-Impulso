import type { CoachSafetyResult } from './types';

const MEDICAL_PATTERNS = [
  /\binjury\b/i,
  /\binjured\b/i,
  /\bpain\b/i,
  /\bhurts?\b/i,
  /\bdoctor\b/i,
  /\bdiagnos/i,
  /\bmedic/i,
  /\blesion/i,
  /\bdolor\b/i,
  /\bherida\b/i,
];

const OUT_OF_SCOPE_PATTERNS = [
  /\binvest\b/i,
  /\btax\b/i,
  /\blegal\b/i,
  /\bcrypto\b/i,
  /\bpolitics\b/i,
];

export function evaluateCoachSafety(message: string): CoachSafetyResult {
  const medical = MEDICAL_PATTERNS.some((pattern) => pattern.test(message));
  if (medical) {
    return {
      withinScope: true,
      escalatedToProfessional: true,
      flags: ['medical_or_injury'],
      directAnswer:
        'I cannot diagnose pain or injury. Stop the movement that causes sharp pain and speak with a qualified professional before continuing. I can help you adapt training only after you have medical clearance.',
    };
  }

  const outOfScope = OUT_OF_SCOPE_PATTERNS.some((pattern) => pattern.test(message));
  if (outOfScope) {
    return {
      withinScope: false,
      escalatedToProfessional: false,
      flags: ['out_of_scope'],
      directAnswer:
        'I can only help with fitness, training, recovery, adherence, and general nutrition habits inside Anclora Impulso.',
    };
  }

  return {
    withinScope: true,
    escalatedToProfessional: false,
    flags: [],
  };
}
