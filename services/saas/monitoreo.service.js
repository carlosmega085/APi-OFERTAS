import { Empresa, Suscripcion, Tienda, sequelize } from '../../models/index.js';

class MonitoreoService {
  /**
   * Obtiene métricas globales para el Dashboard del Gestor.
   */
  async getGlobalMetrics() {
    // 1. Total de empresas activas
    const totalEmpresas = await Empresa.count();
    
    // 2. Ventas globales de hoy (Legacy POS - Eliminado)
    const ventasHoyGlobales = 0;

    // 3. Ranking de empresas por ventas (Legacy POS - Eliminado)
    const rankingEmpresas = [];

    return {
      totalEmpresas,
      ventasHoyGlobales,
      rankingEmpresas
    };
  }

  /**
   * Monitoreo de uso de límites por empresa.
   */
  async getUsageMonitoring() {
    const empresas = await Empresa.findAll({
      include: [
        { model: Tienda },
        { model: Suscripcion }
      ]
    });

    return empresas.map(e => {
      // Sequelize asigna la propiedad basada en el nombre del modelo pluralizado
      const tiendas = e.Tiendas || [];
      const suscripciones = e.Suscripcions || [];

      return {
        id: e.id,
        nombre: e.nombre,
        tiendasCount: tiendas.length,
        activeStatus: (suscripciones.length > 0) ? 'activo' : 'inactivo'
      };
    });
  }
}

export default new MonitoreoService();
