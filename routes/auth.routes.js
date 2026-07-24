import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import authMiddleware, { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import { registerEmpresaSchema, loginSchema } from '../validations/auth.validation.js';
import { registerEmpresaClienteSchema, registerConsultorSchema, registerAuditorSchema } from '../validations/register.validation.js';
import { profileUploadFields } from '../middlewares/uploadDocs.middleware.js';

const router = Router();

// Validation middleware helper
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

router.get('/planes', authController.getPlanes); // Pública para el registro
router.post('/register-empresa', upload.single('comprobante'), validate(registerEmpresaSchema), authController.registerEmpresa);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.me);

// Rutas de Suscripción
router.get('/suscripcion', authMiddleware, authController.getSuscripcion);
router.post('/comprobante-pago', authMiddleware, upload.single('comprobante'), authController.subirComprobante);
router.patch('/aprobar-pago/:id', authMiddleware, authorize('admin'), authController.aprobarPago);

// Rutas de registro específicas de la plataforma
router.post('/register-cliente-empresa', profileUploadFields, validate(registerEmpresaClienteSchema), authController.registerClienteEmpresa);
router.post('/register-consultor', profileUploadFields, validate(registerConsultorSchema), authController.registerConsultor);
router.post('/register-auditor', profileUploadFields, validate(registerAuditorSchema), authController.registerAuditor);

export default router;
