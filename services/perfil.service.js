import { 
  EmpresaPerfil, 
  Consultor, 
  Auditor, 
  Usuario, 
  sequelize 
} from '../models/index.js';
import { supabase } from '../utils/supabase.js';

class PerfilService {
  /**
   * Sube un archivo a Supabase Storage y retorna la URL pública
   */
  async _uploadFileToSupabase(empresa_id, file, bucket = 'comprobantes') {
    const fileName = `${empresa_id}/${Date.now()}-${file.originalname}`;
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
   * Obtiene la información del perfil del usuario según su rol
   */
  async obtenerPerfil(userId, rol, empresaId) {
    const usuario = await Usuario.findByPk(userId, {
      attributes: ['id', 'nombre', 'username', 'email', 'rol', 'estado']
    });

    if (!usuario) throw new Error('Usuario no encontrado.');

    let perfil = null;

    if (rol === 'empresa') {
      perfil = await EmpresaPerfil.findOne({ where: { empresa_id: empresaId } });
    } 
    else if (rol === 'consultor') {
      perfil = await Consultor.findOne({ where: { usuario_id: userId } });
    } 
    else if (rol === 'auditor') {
      perfil = await Auditor.findOne({ where: { usuario_id: userId } });
    }

    return {
      usuario,
      perfil
    };
  }

  /**
   * Actualiza el perfil de la empresa, consultor o auditor
   */
  async actualizarPerfil(userId, rol, empresaId, data, files) {
    const transaction = await sequelize.transaction();
    try {
      let result = null;

      // --- ACTUALIZACIÓN DE EMPRESA ---
      if (rol === 'empresa') {
        const perfil = await EmpresaPerfil.findOne({ 
          where: { empresa_id: empresaId },
          transaction
        });

        if (!perfil) throw new Error('Perfil de empresa no encontrado.');

        let logo_url = perfil.logo_url;
        if (files?.logo && files.logo.length > 0) {
          logo_url = await this._uploadFileToSupabase(empresaId, files.logo[0]);
        }

        const updateData = {
          razon_social: data.razon_social ?? perfil.razon_social,
          rup: data.rup ?? perfil.rup,
          descripcion: data.descripcion ?? perfil.descripcion,
          representante_nombre: data.representante_nombre ?? perfil.representante_nombre,
          representante_telefono: data.representante_telefono ?? perfil.representante_telefono,
          representante_correo: data.representante_correo ?? perfil.representante_correo,
          programa_requisitos: data.programa_requisitos ?? perfil.programa_requisitos,
          tipo_servicio: data.tipo_servicio ?? perfil.tipo_servicio,
          logo_url
        };

        await perfil.update(updateData, { transaction });

        // Sincronizar el nombre y email del representante en la cuenta de Usuario
        const usuario = await Usuario.findByPk(userId, { transaction });
        if (usuario) {
          await usuario.update({
            nombre: updateData.representante_nombre,
            email: updateData.representante_correo
          }, { transaction });
        }

        result = perfil;
      }

      // --- ACTUALIZACIÓN DE CONSULTOR ---
      else if (rol === 'consultor') {
        const perfil = await Consultor.findOne({ 
          where: { usuario_id: userId },
          transaction
        });

        if (!perfil) throw new Error('Perfil de consultor no encontrado.');

        // Verificar si cambian documentos obligatorios o cédula para resetear validación
        let resetEstado = false;
        if (data.cedula && data.cedula !== perfil.cedula) resetEstado = true;
        if (files?.curriculum || files?.titulo) resetEstado = true;

        const getFileUrl = async (multerField, dbField) => {
          if (files?.[multerField] && files[multerField].length > 0) {
            return await this._uploadFileToSupabase(1, files[multerField][0]);
          }
          return perfil[dbField];
        };

        const updateData = {
          cedula: data.cedula ?? perfil.cedula,
          correo: data.correo ?? perfil.correo,
          telefono: data.telefono ?? perfil.telefono,
          cv_url: await getFileUrl('curriculum', 'cv_url'),
          titulo_url: await getFileUrl('titulo', 'titulo_url'),
          maestria_url: await getFileUrl('maestria', 'maestria_url'),
          carta1_url: await getFileUrl('carta1', 'carta1_url'),
          carta2_url: await getFileUrl('carta2', 'carta2_url'),
          carta3_url: await getFileUrl('carta3', 'carta3_url'),
          proforma_url: await getFileUrl('proforma', 'proforma_url'),
          foto_url: await getFileUrl('foto', 'foto_url')
        };

        if (resetEstado) {
          updateData.estado_perfil = 'pendiente';
        }

        await perfil.update(updateData, { transaction });

        // Sincronizar email del Usuario
        const usuario = await Usuario.findByPk(userId, { transaction });
        if (usuario) {
          await usuario.update({ email: updateData.correo }, { transaction });
        }

        result = perfil;
      }

      // --- ACTUALIZACIÓN DE AUDITOR ---
      else if (rol === 'auditor') {
        const perfil = await Auditor.findOne({ 
          where: { usuario_id: userId },
          transaction
        });

        if (!perfil) throw new Error('Perfil de auditor no encontrado.');

        // Verificar si cambian documentos obligatorios o cédula para resetear validación
        let resetEstado = false;
        if (data.cedula && data.cedula !== perfil.cedula) resetEstado = true;
        if (files?.curriculum || files?.titulo) resetEstado = true;

        const getFileUrl = async (multerField, dbField) => {
          if (files?.[multerField] && files[multerField].length > 0) {
            return await this._uploadFileToSupabase(1, files[multerField][0]);
          }
          return perfil[dbField];
        };

        const updateData = {
          cedula: data.cedula ?? perfil.cedula,
          correo: data.correo ?? perfil.correo,
          telefono: data.telefono ?? perfil.telefono,
          cv_url: await getFileUrl('curriculum', 'cv_url'),
          titulo_url: await getFileUrl('titulo', 'titulo_url'),
          capacitacion_url: await getFileUrl('capacitacion', 'capacitacion_url'),
          carta1_url: await getFileUrl('carta1', 'carta1_url'),
          carta2_url: await getFileUrl('carta2', 'carta2_url'),
          carta3_url: await getFileUrl('carta3', 'carta3_url'),
          foto_url: await getFileUrl('foto', 'foto_url')
        };

        if (resetEstado) {
          updateData.estado_perfil = 'pendiente';
        }

        await perfil.update(updateData, { transaction });

        // Sincronizar email del Usuario
        const usuario = await Usuario.findByPk(userId, { transaction });
        if (usuario) {
          await usuario.update({ email: updateData.correo }, { transaction });
        }

        result = perfil;
      }

      else {
        throw new Error('Rol no autorizado para editar perfil.');
      }

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new PerfilService();
