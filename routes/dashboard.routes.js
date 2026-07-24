import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// El dashboard personalizado por rol requiere estar autenticado
router.get('/', authMiddleware, dashboardController.getDashboard);

export default router;
