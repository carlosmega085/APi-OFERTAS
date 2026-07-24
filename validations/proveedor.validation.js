import Joi from 'joi';

export const createProveedorSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  rnc: Joi.string().max(50).optional().allow('', null),
  telefono: Joi.string().max(30).optional().allow('', null),
  email: Joi.string().email().optional().allow('', null),
  direccion: Joi.string().optional().allow('', null),
  estado: Joi.string().valid('activo', 'inactivo').optional().default('activo')
});

export const updateProveedorSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).optional(),
  rnc: Joi.string().max(50).optional().allow('', null),
  telefono: Joi.string().max(30).optional().allow('', null),
  email: Joi.string().email().optional().allow('', null),
  direccion: Joi.string().optional().allow('', null),
  estado: Joi.string().valid('activo', 'inactivo').optional()
});
