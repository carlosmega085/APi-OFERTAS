import { Router } from 'express';
import proveedorController from '../controllers/proveedor.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// Rutas públicas/de consulta para cualquier usuario autenticado
router.get('/', proveedorController.listarProveedores);
router.get('/:id', proveedorController.obtenerProveedor);

export default router;
