import { Router } from 'express';
import perfilController from '../controllers/perfil.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { profileUploadFields } from '../middlewares/uploadDocs.middleware.js';
import { 
  updateEmpresaPerfilSchema, 
  updateConsultorPerfilSchema, 
  updateAuditorPerfilSchema 
} from '../validations/perfil.validation.js';

const router = Router();

// Middleware de validación condicional según el rol del usuario
const validateProfileUpdate = (req, res, next) => {
  const rol = req.user.rol;
  let schema;

  if (rol === 'empresa') schema = updateEmpresaPerfilSchema;
  else if (rol === 'consultor') schema = updateConsultorPerfilSchema;
  else if (rol === 'auditor') schema = updateAuditorPerfilSchema;
  else return next(); // Si es admin no aplicamos esquema condicional

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

router.use(authMiddleware);

router.get('/me', perfilController.obtenerPerfil);
router.put('/me', profileUploadFields, validateProfileUpdate, perfilController.actualizarPerfil);

export default router;
