import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import proveedorController from '../controllers/proveedor.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { createProveedorSchema, updateProveedorSchema } from '../validations/proveedor.validation.js';

const router = Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

// Todas las rutas de administración requieren autenticación y rol de administrador
router.use(authMiddleware, authorize(['admin']));

// --- ADMINISTRACIÓN DE PERFILES ---
router.get('/perfiles/empresas', adminController.getEmpresas);
router.get('/perfiles/consultores', adminController.getConsultores);
router.get('/perfiles/auditores', adminController.getAuditores);

router.patch('/perfiles/empresas/:id/validar', adminController.validarEmpresa);
router.patch('/perfiles/consultores/:id/validar', adminController.validarConsultor);
router.patch('/perfiles/auditores/:id/validar', adminController.validarAuditor);

// --- ADMINISTRACIÓN DE PROVEEDORES VERIFICADOS ---
router.post('/proveedores', validate(createProveedorSchema), proveedorController.crearProveedor);
router.put('/proveedores/:id', validate(updateProveedorSchema), proveedorController.actualizarProveedor);
router.delete('/proveedores/:id', proveedorController.eliminarProveedor);

export default router;
