import Joi from 'joi';

export const updateEmpresaPerfilSchema = Joi.object({
  razon_social: Joi.string().min(3).max(100).optional(),
  rup: Joi.string().min(3).max(50).optional(),
  descripcion: Joi.string().optional().allow('', null),
  representante_nombre: Joi.string().min(3).max(100).optional(),
  representante_telefono: Joi.string().min(6).max(30).optional(),
  representante_correo: Joi.string().email().optional(),
  programa_requisitos: Joi.string().optional().allow('', null),
  tipo_servicio: Joi.string().optional().allow('', null)
});

export const updateConsultorPerfilSchema = Joi.object({
  cedula: Joi.string().min(5).max(30).optional(),
  correo: Joi.string().email().optional(),
  telefono: Joi.string().min(6).max(30).optional()
});

export const updateAuditorPerfilSchema = Joi.object({
  cedula: Joi.string().min(5).max(30).optional(),
  correo: Joi.string().email().optional(),
  telefono: Joi.string().min(6).max(30).optional()
});
