import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { registerSchema, loginSchema } from '../utils/validators';

const router = Router();

// Registro de usuario
router.post('/register', validateBody(registerSchema), authController.register);

// Inicio de sesión
router.post('/login', validateBody(loginSchema), authController.login);

// Obtener usuario actual (requiere autenticación)
router.get('/me', authenticate, authController.getCurrentUser);

// Refrescar token
router.post('/refresh', authController.refreshToken);

// Cerrar sesión
router.post('/logout', authController.logout);

export default router;
