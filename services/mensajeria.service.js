import { Conversacion, Mensaje, Usuario, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

class MensajeriaService {
  async obtenerOCrearConversacion(userAId, userBId) {
    if (userAId === userBId) {
      throw new Error('No puedes crear una conversación contigo mismo.');
    }

    // Validar que ambos usuarios existan
    const usuarioA = await Usuario.findByPk(userAId);
    const usuarioB = await Usuario.findByPk(userBId);
    if (!usuarioA || !usuarioB) {
      throw new Error('Uno o ambos usuarios no existen.');
    }

    const usuario1_id = Math.min(userAId, userBId);
    const usuario2_id = Math.max(userAId, userBId);

    const [conversacion] = await Conversacion.findOrCreate({
      where: { usuario1_id, usuario2_id },
      defaults: {
        usuario1_id,
        usuario2_id
      }
    });

    return conversacion;
  }

  async listarConversaciones(usuarioId) {
    const conversaciones = await Conversacion.findAll({
      where: {
        [Op.or]: [
          { usuario1_id: usuarioId },
          { usuario2_id: usuarioId }
        ]
      },
      order: [['fecha_ultimo_mensaje', 'DESC'], ['updated_at', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario1',
          attributes: ['id', 'nombre', 'username', 'rol', 'email']
        },
        {
          model: Usuario,
          as: 'usuario2',
          attributes: ['id', 'nombre', 'username', 'rol', 'email']
        }
      ]
    });

    // Formatear para que retorne directamente "otro_usuario"
    return conversaciones.map(conv => {
      const plainConv = conv.get({ plain: true });
      const otroUsuario = plainConv.usuario1_id === usuarioId ? plainConv.usuario2 : plainConv.usuario1;
      
      delete plainConv.usuario1;
      delete plainConv.usuario2;
      
      return {
        ...plainConv,
        otro_usuario: otroUsuario
      };
    });
  }

  async listarMensajes(usuarioId, conversacionId, limit = 50, offset = 0) {
    const conversacion = await Conversacion.findByPk(conversacionId);
    if (!conversacion) {
      throw new Error('Conversación no encontrada.');
    }

    // Validar que el usuario sea parte de la conversación
    if (conversacion.usuario1_id !== usuarioId && conversacion.usuario2_id !== usuarioId) {
      throw new Error('No tienes permisos para ver esta conversación.');
    }

    // Buscar mensajes de la conversación
    const mensajes = await Mensaje.findAll({
      where: { conversacion_id: conversacionId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']],
      include: [
        {
          model: Usuario,
          as: 'emisor',
          attributes: ['id', 'nombre', 'rol']
        }
      ]
    });

    // Marcar mensajes no leídos como leídos (mensajes recibidos)
    await Mensaje.update(
      { leido: true, fecha_lectura: new Date() },
      {
        where: {
          conversacion_id: conversacionId,
          emisor_id: { [Op.ne]: usuarioId },
          leido: false
        }
      }
    );

    return mensajes;
  }

  async enviarMensaje(usuarioId, conversacionId, contenido) {
    const conversacion = await Conversacion.findByPk(conversacionId);
    if (!conversacion) {
      throw new Error('Conversación no encontrada.');
    }

    // Validar que el usuario sea parte de la conversación
    if (conversacion.usuario1_id !== usuarioId && conversacion.usuario2_id !== usuarioId) {
      throw new Error('No tienes permisos para enviar mensajes en esta conversación.');
    }

    const transaction = await sequelize.transaction();
    try {
      const mensaje = await Mensaje.create({
        conversacion_id: conversacionId,
        emisor_id: usuarioId,
        contenido: contenido.trim(),
        leido: false
      }, { transaction });

      // Actualizar los datos de la conversación
      await conversacion.update({
        ultimo_mensaje: contenido.trim(),
        fecha_ultimo_mensaje: new Date()
      }, { transaction });

      await transaction.commit();

      // Devolver mensaje completo con su emisor
      return await Mensaje.findByPk(mensaje.id, {
        include: [
          {
            model: Usuario,
            as: 'emisor',
            attributes: ['id', 'nombre', 'rol']
          }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new MensajeriaService();
