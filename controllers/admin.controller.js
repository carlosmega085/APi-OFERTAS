import adminService from '../services/admin.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class AdminController {
  async getEmpresas(req, res) {
    try {
      const { estado_perfil } = req.query;
      const result = await adminService.getEmpresas({ estado_perfil });
      return sendSuccess(res, result, 'Perfiles de empresas obtenidos');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getConsultores(req, res) {
    try {
      const { estado_perfil } = req.query;
      const result = await adminService.getConsultores({ estado_perfil });
      return sendSuccess(res, result, 'Perfiles de consultores obtenidos');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getAuditores(req, res) {
    try {
      const { estado_perfil } = req.query;
      const result = await adminService.getAuditores({ estado_perfil });
      return sendSuccess(res, result, 'Perfiles de auditores en formación obtenidos');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async validarEmpresa(req, res) {
    try {
      const { id } = req.params;
      const { estado_perfil } = req.body;
      const result = await adminService.validarEmpresa(id, estado_perfil);
      return sendSuccess(res, result, `Perfil de empresa actualizado a ${estado_perfil}`);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async validarConsultor(req, res) {
    try {
      const { id } = req.params;
      const { estado_perfil } = req.body;
      const result = await adminService.validarConsultor(id, estado_perfil);
      return sendSuccess(res, result, `Perfil de consultor actualizado a ${estado_perfil}`);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async validarAuditor(req, res) {
    try {
      const { id } = req.params;
      const { estado_perfil } = req.body;
      const result = await adminService.validarAuditor(id, estado_perfil);
      return sendSuccess(res, result, `Perfil de auditor actualizado a ${estado_perfil}`);
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new AdminController();
