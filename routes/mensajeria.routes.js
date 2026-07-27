import { Router } from 'express';
import mensajeriaController from '../controllers/mensajeria.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createConversacionSchema, enviarMensajeSchema } from '../validations/mensajeria.validation.js';

const router = Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

// Todas las rutas de mensajería requieren autenticación
router.use(authMiddleware);

router.get('/conversaciones', mensajeriaController.listarConversaciones);
router.post('/conversaciones', validate(createConversacionSchema), mensajeriaController.obtenerOCrearConversacion);
router.get('/conversaciones/:id/mensajes', mensajeriaController.listarMensajes);
router.post('/conversaciones/:id/mensajes', validate(enviarMensajeSchema), mensajeriaController.enviarMensaje);

export default router;
