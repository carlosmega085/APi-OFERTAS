import monitoreoService from '../../services/saas/monitoreo.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

class MonitoreoController {
  async getDashboard(req, res) {
    try {
      const metrics = await monitoreoService.getGlobalMetrics();
      return sendSuccess(res, metrics, 'Métricas globales obtenidas');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async getEmpresasStatus(req, res) {
    try {
      const status = await monitoreoService.getUsageMonitoring();
      return sendSuccess(res, status, 'Estado de empresas obtenido');
    } catch (error) {
      return sendError(res, error.message);
    }
  }
}

export default new MonitoreoController();
