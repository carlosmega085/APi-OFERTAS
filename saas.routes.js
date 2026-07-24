import { Router } from 'express';
import { authenticate } from './middlewares/auth.middleware.js';
import { authorize } from './middlewares/role.middleware.js';

// ─── Imports SaaS Admin ──────────────────────────────
import empresaRoutes from './empresas/empresa.routes.js';
import planRoutes from './planes/plan.routes.js';
import suscripcionRoutes from './suscripciones/suscripcion.routes.js';
import configRoutes from './routes/config.routes.js';

// NEW SAAS MONITORING
import monitoreoController from './controllers/saas/monitoreo.controller.js';

const router = Router();

// ─── Proteger rutas globales SaaS (vía JWT local y rol admin) ────────
router.use(authenticate);
router.use(authorize(['admin']));

// ─── Rutas SaaS Admin ────────────────────────────────
router.use('/empresas', empresaRoutes);
router.use('/planes', planRoutes);
router.use('/suscripciones', suscripcionRoutes);
router.use('/config', configRoutes);

// MONITOR DE USO GLOBAL
router.get('/monitoreo', monitoreoController.getDashboard);
router.get('/status-empresas', monitoreoController.getEmpresasStatus);

export default router;
