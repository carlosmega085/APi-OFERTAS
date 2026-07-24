import perfilService from '../services/perfil.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class PerfilController {
  async obtenerPerfil(req, res) {
    try {
      const { id, rol, empresa_id } = req.user;
      const data = await perfilService.obtenerPerfil(id, rol, empresa_id);
      return sendSuccess(res, data, 'Información del perfil obtenida.');
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener el perfil.');
    }
  }

  async actualizarPerfil(req, res) {
    try {
      const { id, rol, empresa_id } = req.user;
      const updated = await perfilService.actualizarPerfil(id, rol, empresa_id, req.body, req.files);
      
      let message = 'Perfil actualizado exitosamente.';
      if (updated.estado_perfil === 'pendiente' && (rol === 'consultor' || rol === 'auditor')) {
        message += ' Nota: Debido a cambios en campos críticos o documentos, tu perfil ha vuelto al estado pendiente de validación por administración.';
      }

      return sendSuccess(res, updated, message);
    } catch (error) {
      return sendError(res, error.message || 'Error al actualizar el perfil.');
    }
  }
}

export default new PerfilController();
