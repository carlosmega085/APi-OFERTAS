import dashboardService from '../services/dashboard.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class DashboardController {
  async getDashboard(req, res) {
    try {
      const { id, rol, empresa_id } = req.user;
      
      const dashboardData = await dashboardService.getDashboardData(id, rol, empresa_id);
      
      return sendSuccess(res, dashboardData, `Dashboard de ${rol} obtenido exitosamente`);
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener datos del dashboard');
    }
  }
}

export default new DashboardController();
