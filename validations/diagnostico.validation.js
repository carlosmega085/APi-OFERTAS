import Joi from 'joi';

export const createDiagnosticoSchema = Joi.object({
  empresa_id: Joi.number().integer().positive().required(),
  auditor_id: Joi.number().integer().positive().optional().allow(null),
  puntaje_cumplimiento: Joi.number().min(0).max(100).optional().default(0),
  observaciones: Joi.string().optional().allow('', null),
  estado: Joi.string().valid('borrador', 'finalizado').optional().default('borrador')
});

export const addRecomendacionesSchema = Joi.object({
  recomendaciones: Joi.array().items(
    Joi.object({
      tipo_sugerencia: Joi.string().valid('insumo', 'servicio', 'equipo').required(),
      descripcion: Joi.string().min(3).required(),
      norma_asociada: Joi.string().optional().allow('', null),
      proveedor_id: Joi.number().integer().positive().optional().allow(null)
    })
  ).min(1).required()
});

export const signDiagnosticoSchema = Joi.object({
  firma_nombre: Joi.string().min(2).max(100).required()
});

export const updateSeguimientoSchema = Joi.object({
  estado_seguimiento: Joi.string().valid('pendiente', 'en_progreso', 'implementado').required()
});
