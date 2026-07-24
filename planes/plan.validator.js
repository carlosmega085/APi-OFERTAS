import Joi from 'joi';

export const validateCrearPlan = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string().required(),
    precio: Joi.number().optional(),
    limite_usuarios: Joi.number().integer().min(0).optional(),
    limite_tiendas: Joi.number().integer().min(0).optional(),
    limite_productos: Joi.number().integer().min(0).optional(),
    limite_variantes_por_p: Joi.number().integer().min(0).optional(),
    max_vendedores_por_tienda: Joi.number().integer().min(0).optional(),
    permite_fotos: Joi.boolean().optional(),
    estado: Joi.string().valid('activo', 'inactivo').optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};

export const validateEditarPlan = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string().optional(),
    precio: Joi.number().optional(),
    limite_usuarios: Joi.number().integer().min(0).optional(),
    limite_tiendas: Joi.number().integer().min(0).optional(),
    limite_productos: Joi.number().integer().min(0).optional(),
    limite_variantes_por_p: Joi.number().integer().min(0).optional(),
    max_vendedores_por_tienda: Joi.number().integer().min(0).optional(),
    permite_fotos: Joi.boolean().optional(),
    estado: Joi.string().valid('activo', 'inactivo').optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};

export const validatePlanId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required()
  });

  const { error } = schema.validate({ id: req.params.id });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'ID de plan inválido',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};
