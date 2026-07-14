import dotenv from 'dotenv';

dotenv.config();

function expandFrontendAliases(rawOrigins: string[]) {
  const aliases = new Set<string>();

  for (const origin of rawOrigins) {
    aliases.add(origin);

    try {
      const url = new URL(origin);

      if (url.hostname === 'localhost') {
        aliases.add(origin.replace('localhost', '127.0.0.1'));
      }

      if (url.hostname === '127.0.0.1') {
        aliases.add(origin.replace('127.0.0.1', 'localhost'));
      }
    } catch {
      // Ignore malformed entries and preserve the original value only.
    }
  }

  return [...aliases];
}

const configuredFrontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

export const env = {
  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  frontendUrls: expandFrontendAliases(configuredFrontendUrls),

  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),

  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '',
  notificationDispatchIntervalMinutes: parseInt(process.env.NOTIFICATION_DISPATCH_INTERVAL_MINUTES || '15', 10),

  // LLM (Groq / modelos open source)
  llmProvider: process.env.LLM_PROVIDER || 'groq',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  llmCoachEnabled: process.env.LLM_COACH_ENABLED === 'true',
  llmCoachMaxPromptChars: parseInt(process.env.LLM_COACH_MAX_PROMPT_CHARS || '6000', 10),
  llmCoachMaxOutputTokens: parseInt(process.env.LLM_COACH_MAX_OUTPUT_TOKENS || '450', 10),
  llmCoachMemoryMessages: parseInt(process.env.LLM_COACH_MEMORY_MESSAGES || '8', 10),
  llmCoachCacheTtlSeconds: parseInt(process.env.LLM_COACH_CACHE_TTL_SECONDS || '300', 10),
  llmCoachWindowMinutes: parseInt(process.env.LLM_COACH_WINDOW_MINUTES || '60', 10),
  llmCoachWindowLimit: parseInt(process.env.LLM_COACH_WINDOW_LIMIT || '20', 10),
  healthDataImportEnabled: process.env.HEALTH_DATA_IMPORT_ENABLED === 'true',
  wearableSyncEnabled: process.env.WEARABLE_SYNC_ENABLED === 'true',
  wearableReadinessEnabled: process.env.WEARABLE_READINESS_ENABLED === 'true',
  formAnalysisEnabled: process.env.FORM_ANALYSIS_ENABLED === 'true',
  voiceCoachEnabled: process.env.VOICE_COACH_ENABLED === 'true',

  // Legacy (deprecated, usar GROQ_API_KEY)
  openaiApiKey: process.env.OPENAI_API_KEY || '',
};

// Validar variables de entorno críticas
if (!env.databaseUrl) {
  console.warn('⚠️  DATABASE_URL no está configurada');
}

if (env.nodeEnv === 'production') {
  if (env.jwtSecret === 'default-secret-change-in-production') {
    throw new Error('JWT_SECRET debe ser configurado en producción');
  }
  if (env.jwtRefreshSecret === 'default-refresh-secret-change-in-production') {
    throw new Error('JWT_REFRESH_SECRET debe ser configurado en producción');
  }
}
