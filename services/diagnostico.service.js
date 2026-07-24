import { 
  Diagnostico, 
  Recomendacion, 
  Consultor, 
  Auditor, 
  Empresa, 
  Usuario, 
  Proveedor, 
  sequelize 
} from '../models/index.js';
import { Op } from 'sequelize';
import { supabase } from '../utils/supabase.js';

class DiagnosticoService {
  /**
   * Crea un nuevo diagnóstico en borrador (o finalizado directo si se indica)
   */
  async crearDiagnostico(usuarioId, data) {
    const consultor = await Consultor.findOne({ where: { usuario_id: usuarioId } });
    if (!consultor) {
      throw new Error('Perfil de consultor no encontrado para este usuario.');
    }

    if (consultor.estado_perfil !== 'aprobado') {
      throw new Error('El perfil de consultor debe estar aprobado para realizar diagnósticos.');
    }

    // Validar que la empresa exista
    const empresa = await Empresa.findByPk(data.empresa_id);
    if (!empresa) {
      throw new Error('La empresa seleccionada no existe.');
    }

    // Validar que el auditor exista si viene especificado
    if (data.auditor_id) {
      const auditor = await Auditor.findByPk(data.auditor_id);
      if (!auditor) {
        throw new Error('El auditor en formación seleccionado no existe.');
      }
    }

    const diagnostico = await Diagnostico.create({
      empresa_id: data.empresa_id,
      consultor_id: consultor.id,
      auditor_id: data.auditor_id || null,
      puntaje_cumplimiento: data.puntaje_cumplimiento || 0.00,
      observaciones: data.observaciones || null,
      estado: data.estado || 'borrador'
    });

    return diagnostico;
  }

  /**
   * Agrega múltiples recomendaciones en bloque a un diagnóstico existente
   */
  async agregarRecomendaciones(usuarioId, diagnosticoId, recomendacionesList) {
    const consultor = await Consultor.findOne({ where: { usuario_id: usuarioId } });
    if (!consultor) {
      throw new Error('Perfil de consultor no encontrado.');
    }

    const diagnostico = await Diagnostico.findByPk(diagnosticoId);
    if (!diagnostico) {
      throw new Error('Diagnóstico no encontrado.');
    }

    // Validar que el consultor sea el dueño del diagnóstico
    if (diagnostico.consultor_id !== consultor.id) {
      throw new Error('No tienes permisos para agregar recomendaciones a este diagnóstico.');
    }

    if (diagnostico.estado === 'finalizado') {
      throw new Error('No se pueden agregar recomendaciones a un diagnóstico ya finalizado.');
    }

    const transaction = await sequelize.transaction();
    try {
      // Validar proveedores si vienen especificados
      for (const rec of recomendacionesList) {
        if (rec.proveedor_id) {
          const prov = await Proveedor.findByPk(rec.proveedor_id);
          if (!prov) {
            throw new Error(`El proveedor seleccionado con ID ${rec.proveedor_id} no existe.`);
          }
        }
      }

      const sugerencias = recomendacionesList.map(r => ({
        diagnostico_id: diagnosticoId,
        tipo_sugerencia: r.tipo_sugerencia,
        descripcion: r.descripcion,
        norma_asociada: r.norma_asociada || null,
        proveedor_id: r.proveedor_id || null
      }));

      const creadas = await Recomendacion.bulkCreate(sugerencias, { transaction });
      await transaction.commit();

      return creadas;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Lista los diagnósticos filtrando y controlando acceso por rol
   */
  async listarDiagnosticos(usuarioId, rol, empresaId) {
    const where = {};

    if (rol === 'consultor') {
      const consultor = await Consultor.findOne({ where: { usuario_id: usuarioId } });
      if (!consultor) throw new Error('Perfil de consultor no encontrado.');
      where.consultor_id = consultor.id;
    } 
    else if (rol === 'auditor') {
      const auditor = await Auditor.findOne({ where: { usuario_id: usuarioId } });
      if (!auditor) throw new Error('Perfil de auditor no encontrado.');
      where.auditor_id = auditor.id;
    } 
    else if (rol === 'empresa') {
      where.empresa_id = empresaId;
      where.estado = { [Op.in]: ['finalizado', 'firmado'] }; // Las empresas ven finalizados y firmados
    } 
    else if (rol === 'admin') {
      // El admin puede ver todos
    } 
    else {
      throw new Error('Rol no autorizado para listar diagnósticos.');
    }

    return await Diagnostico.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        { model: Empresa, attributes: ['id', 'nombre'] },
        { 
          model: Consultor, 
          attributes: ['id', 'cedula'],
          include: [{ model: Usuario, attributes: ['nombre'] }] 
        }
      ]
    });
  }

  /**
   * Obtiene un diagnóstico detallado con sus recomendaciones y restringe el acceso según rol
   */
  async obtenerDiagnosticoPorId(usuarioId, rol, empresaId, id) {
    const diagnostico = await Diagnostico.findByPk(id, {
      include: [
        { model: Empresa, attributes: ['id', 'nombre'] },
        {
          model: Consultor,
          include: [{ model: Usuario, attributes: ['nombre', 'email'] }]
        },
        {
          model: Auditor,
          include: [{ model: Usuario, attributes: ['nombre', 'email'] }]
        },
        {
          model: Recomendacion,
          as: 'recomendaciones',
          include: [{ model: Proveedor, attributes: ['nombre', 'telefono', 'email'] }]
        }
      ]
    });

    if (!diagnostico) {
      throw new Error('Diagnóstico no encontrado.');
    }

    // Control de accesos
    if (rol === 'empresa') {
      if (diagnostico.empresa_id !== empresaId) {
        throw new Error('Acceso no autorizado.');
      }
      if (diagnostico.estado === 'borrador') {
        throw new Error('Este diagnóstico aún se encuentra en borrador y no es visible.');
      }
    } 
    else if (rol === 'consultor') {
      const consultor = await Consultor.findOne({ where: { usuario_id: usuarioId } });
      if (!consultor || diagnostico.consultor_id !== consultor.id) {
        throw new Error('Acceso no autorizado.');
      }
    } 
    else if (rol === 'auditor') {
      const auditor = await Auditor.findOne({ where: { usuario_id: usuarioId } });
      if (!auditor || diagnostico.auditor_id !== auditor.id) {
        throw new Error('Acceso no autorizado.');
      }
    } 
    else if (rol !== 'admin') {
      throw new Error('Rol no autorizado.');
    }

    return diagnostico;
  }

  /**
   * Finaliza un diagnóstico para que sea visible para la empresa
   */
  async finalizarDiagnostico(usuarioId, id) {
    const consultor = await Consultor.findOne({ where: { usuario_id: usuarioId } });
    if (!consultor) {
      throw new Error('Perfil de consultor no encontrado.');
    }

    const diagnostico = await Diagnostico.findByPk(id);
    if (!diagnostico) {
      throw new Error('Diagnóstico no encontrado.');
    }

    if (diagnostico.consultor_id !== consultor.id) {
      throw new Error('No tienes permisos para modificar este diagnóstico.');
    }

    if (diagnostico.estado === 'finalizado') {
      throw new Error('El diagnóstico ya se encuentra finalizado.');
    }

    await diagnostico.update({ estado: 'finalizado' });
    return diagnostico;
  }

  /**
   * Sube un archivo de evidencia a Supabase Storage
   */
  async _uploadFileToSupabase(empresa_id, file, bucket = 'comprobantes') {
    const fileName = `recomendaciones/${empresa_id}/${Date.now()}-${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw new Error(`Error Supabase: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Firma un diagnóstico por parte de la empresa
   */
  async firmarDiagnostico(usuarioId, rol, empresaId, id, { firma_nombre }) {
    if (rol !== 'empresa' && rol !== 'admin') {
      throw new Error('Solo los usuarios de rol empresa o administradores pueden firmar diagnósticos.');
    }

    const diagnostico = await Diagnostico.findByPk(id);
    if (!diagnostico) {
      throw new Error('Diagnóstico no encontrado.');
    }

    // Si es empresa, validar que sea su propio diagnóstico
    if (rol === 'empresa' && diagnostico.empresa_id !== empresaId) {
      throw new Error('No tienes permisos para firmar este diagnóstico.');
    }

    if (diagnostico.estado === 'borrador') {
      throw new Error('No se puede firmar un diagnóstico en borrador.');
    }

    if (diagnostico.estado === 'firmado') {
      throw new Error('El diagnóstico ya se encuentra firmado.');
    }

    await diagnostico.update({
      estado: 'firmado',
      firma_nombre,
      fecha_firma: new Date()
    });

    return diagnostico;
  }

  /**
   * Actualiza el estado de seguimiento y carga evidencia de una recomendación
   */
  async actualizarSeguimientoRecomendacion(usuarioId, rol, empresaId, recomendacionId, { estado_seguimiento }, file) {
    if (rol !== 'empresa' && rol !== 'admin') {
      throw new Error('Solo los usuarios de rol empresa o administradores pueden actualizar el seguimiento.');
    }

    const recomendacion = await Recomendacion.findByPk(recomendacionId, {
      include: [{ model: Diagnostico }]
    });

    if (!recomendacion || !recomendacion.Diagnostico) {
      throw new Error('Recomendación no encontrada.');
    }

    const diagnostico = recomendacion.Diagnostico;

    // Si es empresa, validar que pertenezca a su empresa
    if (rol === 'empresa' && diagnostico.empresa_id !== empresaId) {
      throw new Error('No tienes permisos para modificar el seguimiento de esta recomendación.');
    }

    if (diagnostico.estado === 'borrador') {
      throw new Error('No se puede actualizar el seguimiento de un diagnóstico en borrador.');
    }

    let evidencia_url = recomendacion.evidencia_url;
    if (file) {
      evidencia_url = await this._uploadFileToSupabase(diagnostico.empresa_id, file);
    }

    const updateData = {
      estado_seguimiento,
      evidencia_url
    };

    if (estado_seguimiento === 'implementado') {
      updateData.fecha_implementacion = new Date();
    } else {
      updateData.fecha_implementacion = null;
    }

    await recomendacion.update(updateData);
    return recomendacion;
  }
}

export default new DiagnosticoService();
