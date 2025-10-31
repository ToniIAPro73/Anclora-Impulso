import dotenv from 'dotenv';

dotenv.config();

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

  // OpenAI
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
