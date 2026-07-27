import mensajeriaService from '../services/mensajeria.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class MensajeriaController {
  async obtenerOCrearConversacion(req, res) {
    try {
      const { receptor_id } = req.body;
      const conversacion = await mensajeriaService.obtenerOCrearConversacion(req.user.id, receptor_id);
      return sendSuccess(res, conversacion, 'Conversación obtenida o creada exitosamente.', 200);
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener o crear la conversación.');
    }
  }

  async listarConversaciones(req, res) {
    try {
      const conversaciones = await mensajeriaService.listarConversaciones(req.user.id);
      return sendSuccess(res, conversaciones, 'Conversaciones obtenidas exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al listar las conversaciones.');
    }
  }

  async listarMensajes(req, res) {
    try {
      const { id } = req.params; // ID de la conversación
      const { limit = 50, offset = 0 } = req.query;
      const mensajes = await mensajeriaService.listarMensajes(req.user.id, id, limit, offset);
      return sendSuccess(res, mensajes, 'Mensajes de la conversación obtenidos exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener los mensajes.');
    }
  }

  async enviarMensaje(req, res) {
    try {
      const { id } = req.params; // ID de la conversación
      const { contenido } = req.body;
      const mensaje = await mensajeriaService.enviarMensaje(req.user.id, id, contenido);
      return sendSuccess(res, mensaje, 'Mensaje enviado exitosamente.', 201);
    } catch (error) {
      return sendError(res, error.message || 'Error al enviar el mensaje.');
    }
  }
}

export default new MensajeriaController();
