import app from './app';
import { env } from './config/env';
import { testDatabaseConnection } from './config/database';

async function startServer() {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.log('💡 Asegúrate de configurar DATABASE_URL en el archivo .env');
      console.log('💡 Ejemplo: DATABASE_URL="postgresql://user:password@host:5432/database"');
      
      if (env.nodeEnv === 'production') {
        process.exit(1);
      }
    }

    // Iniciar servidor
    const server = app.listen(env.port, () => {
      console.log('🚀 Servidor iniciado');
      console.log(`📍 URL: http://localhost:${env.port}`);
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

    // Manejo de señales de terminación
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} recibido, cerrando servidor...`);
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
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
