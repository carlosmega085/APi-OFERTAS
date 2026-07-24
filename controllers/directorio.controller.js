import directorioService from '../services/directorio.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class DirectorioController {
  /**
   * Lista los consultores aprobados en la plataforma.
   */
  async listarConsultores(req, res) {
    try {
      const consultores = await directorioService.listarConsultoresAprobados();
      return sendSuccess(res, consultores, 'Directorio de consultores obtenido exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener el directorio de consultores.');
    }
  }

  /**
   * Lista las empresas aprobadas en la plataforma.
   */
  async listarEmpresas(req, res) {
    try {
      const empresas = await directorioService.listarEmpresasAprobadas();
      return sendSuccess(res, empresas, 'Directorio de empresas obtenido exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener el directorio de empresas.');
    }
  }

  /**
   * Lista los auditores en formación aprobados en la plataforma.
   */
  async listarAuditores(req, res) {
    try {
      const auditores = await directorioService.listarAuditoresAprobados();
      return sendSuccess(res, auditores, 'Directorio de auditores en formación obtenido exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener el directorio de auditores.');
    }
  }
}

export default new DirectorioController();
