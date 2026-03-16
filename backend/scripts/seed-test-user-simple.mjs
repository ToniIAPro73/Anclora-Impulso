// Script simple para crear usuario de prueba
// Usa SQL plano a través de Prisma

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('🌱 Creando usuario de prueba...');

    // Hash bcrypt para "Test123456" con salt rounds = 10
    const passwordHash = "$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5E.xo3UEMLeWe";

    // Crear usuario usando Prisma
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        passwordHash,
        fullName: 'Usuario Prueba',
      },
    });

    console.log('✅ Usuario de prueba creado/confirmado exitosamente');
    console.log('');
    console.log('Credenciales de acceso:');
    console.log('  Email: test@example.com');
    console.log('  Contraseña: Test123456');
    console.log('  ID: ' + user.id);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
