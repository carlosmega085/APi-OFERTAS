import Joi from 'joi';

export const createConversacionSchema = Joi.object({
  receptor_id: Joi.number().integer().positive().required()
});

export const enviarMensajeSchema = Joi.object({
  contenido: Joi.string().trim().min(1).max(2000).required()
});
