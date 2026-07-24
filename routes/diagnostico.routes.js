import { Router } from 'express';
import diagnosticoController from '../controllers/diagnostico.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { 
  createDiagnosticoSchema, 
  addRecomendacionesSchema,
  signDiagnosticoSchema,
  updateSeguimientoSchema
} from '../validations/diagnostico.validation.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

router.use(authMiddleware);

// Rutas compartidas (el control de acceso fino se realiza a nivel de servicio)
router.get('/', diagnosticoController.listarDiagnosticos);
router.get('/:id', diagnosticoController.obtenerDiagnostico);

// Rutas exclusivas del profesional Consultor
router.post('/', authorize(['consultor']), validate(createDiagnosticoSchema), diagnosticoController.crearDiagnostico);
router.post('/:id/recomendaciones', authorize(['consultor']), validate(addRecomendacionesSchema), diagnosticoController.agregarRecomendaciones);
router.patch('/:id/finalizar', authorize(['consultor']), diagnosticoController.finalizarDiagnostico);

// Rutas de Firma y Seguimiento (Empresa o Admin)
router.patch('/:id/firmar', authorize(['empresa', 'admin']), validate(signDiagnosticoSchema), diagnosticoController.firmarDiagnostico);
router.put('/recomendaciones/:recomendacionId/seguimiento', authorize(['empresa', 'admin']), upload.single('evidencia'), validate(updateSeguimientoSchema), diagnosticoController.actualizarSeguimientoRecomendacion);

export default router;
