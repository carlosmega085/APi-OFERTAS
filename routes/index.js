import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import tiendaRoutes from './tienda.routes.js';
import empresaRoutes from './empresa.routes.js';
import peticionRoutes from './peticion.routes.js';
import adminRoutes from './admin.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import diagnosticoRoutes from './diagnostico.routes.js';
import proveedorRoutes from './proveedor.routes.js';
import perfilRoutes from './perfil.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/tiendas', tiendaRoutes); // Sucursales / Establecimientos
router.use('/empresa', empresaRoutes);
router.use('/confirmar', peticionRoutes); // Idempotencia / Safety Net
router.use('/admin', adminRoutes); // Validación y administración de perfiles
router.use('/dashboard', dashboardRoutes); // Dashboard dinámico por rol de usuario
router.use('/diagnosticos', diagnosticoRoutes); // Gestión de diagnósticos y recomendaciones
router.use('/proveedores', proveedorRoutes); // Consulta de proveedores verificados
router.use('/perfil', perfilRoutes); // Edición y consulta de perfil de usuario actual

export default router;
