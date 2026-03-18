import app from './app';
import { env } from './config/env';
import { prisma, testDatabaseConnection } from './config/database';

async function startServer() {
  try {
    // Iniciar servidor primero
    const server = app.listen(env.port, '0.0.0.0', () => {
      console.log('🚀 Servidor iniciado');
      console.log(`📍 URL: http://0.0.0.0:${env.port}`);
      console.log(`🌍 Entorno: ${env.nodeEnv}`);
      console.log(`🔗 Frontend: ${env.frontendUrl}`);
      console.log('\n✨ Rutas disponibles:');
      console.log('   GET  /health');
      console.log('   POST /api/auth/register');
      console.log('   POST /api/auth/login');
      console.log('   GET  /api/auth/me');
      console.log('   GET  /api/exercises');
      console.log('   GET  /api/workouts');
      console.log('   POST /api/workouts/generate');
      console.log('   GET  /api/sessions');
      console.log('   GET  /api/progress/complete');
    });

    // Verificar conexión a BD en background (sin bloquear inicio del servidor)
    if (env.nodeEnv === 'production') {
      testDatabaseConnection();
    } else {
      // En desarrollo, intentar conexión sin bloquear
      setTimeout(() => {
        testDatabaseConnection();
      }, 1000);
    }

    // Manejo de señales de terminación
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} recibido, cerrando servidor...`);
      server.close(() => {
        prisma
          .$disconnect()
          .catch((error) => {
            console.error('⚠️ Error al desconectar Prisma durante el cierre:', error);
          })
          .finally(() => {
            console.log('✅ Servidor cerrado correctamente');
            process.exit(0);
          });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
