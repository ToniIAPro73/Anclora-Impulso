import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/utils/password';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Creando usuario de prueba...');

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (existingUser) {
      console.log('ℹ️  El usuario de prueba ya existe');
      console.log('');
      console.log('Credenciales de acceso:');
      console.log('  Email: test@example.com');
      console.log('  Contraseña: Test123456');
      return;
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword('Test123456');

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash,
        fullName: 'Usuario Prueba',
      },
    });

    console.log('✅ Usuario de prueba creado exitosamente');
    console.log('');
    console.log('Credenciales de acceso:');
    console.log('  Email: test@example.com');
    console.log('  Contraseña: Test123456');
    console.log('  ID: ' + user.id);
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
