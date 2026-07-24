import { Router } from 'express';
import directorioController from '../controllers/directorio.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// 1. Directorio de Consultores (Accesible para todos los roles)
router.get('/consultores', directorioController.listarConsultores);

// 2. Directorio de Empresas (Accesible para Consultores, Auditores y Admins)
router.get('/empresas', authorize(['consultor', 'auditor', 'admin']), directorioController.listarEmpresas);

// 3. Directorio de Auditores en formación (Accesible para Consultores y Admins)
router.get('/auditores', authorize(['consultor', 'admin']), directorioController.listarAuditores);

export default router;
