-- Script para crear usuario de prueba
-- Contraseña: Test123456
-- Hash bcrypt generado con salt rounds = 10

INSERT INTO users (id, email, "passwordHash", "fullName", "createdAt", "updatedAt")
VALUES (
  'test-user-001',
  'test@example.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5E.xo3UEMLeWe',
  'Usuario Prueba',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar que se creó
SELECT id, email, "fullName", "createdAt" FROM users WHERE email = 'test@example.com';
