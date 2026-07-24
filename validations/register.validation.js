import Joi from 'joi';

export const registerEmpresaClienteSchema = Joi.object({
  nombre_empresa: Joi.string().min(3).max(100).required(),
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  razon_social: Joi.string().min(3).max(100).required(),
  rup: Joi.string().min(3).max(50).required(),
  descripcion: Joi.string().optional().allow('', null),
  representante_nombre: Joi.string().min(3).max(100).required(),
  representante_telefono: Joi.string().min(6).max(30).required(),
  representante_correo: Joi.string().email().required(),
  programa_requisitos: Joi.string().optional().allow('', null),
  tipo_servicio: Joi.string().optional().allow('', null)
});

export const registerConsultorSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  cedula: Joi.string().min(5).max(30).required(),
  correo: Joi.string().email().required(),
  telefono: Joi.string().min(6).max(30).required()
});

export const registerAuditorSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  cedula: Joi.string().min(5).max(30).required(),
  correo: Joi.string().email().required(),
  telefono: Joi.string().min(6).max(30).required()
});
