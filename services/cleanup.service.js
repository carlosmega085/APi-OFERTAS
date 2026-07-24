import {
  PeticionProcesada,
  SaaSConfig,
  sequelize
} from '../models/index.js';
import { Op } from 'sequelize';
import cron from 'node-cron';

/**
 * Servicio de limpieza automática para el sistema SaaS.
 * Mantiene la base de datos eficiente eliminando registros antiguos (ej. peticiones idempotentes).
 */
class CleanupService {
  /**
   * Ejecuta la limpieza de registros con más de 48 horas de antigüedad en peticiones procesadas.
   */
  async limpiarPeticionesAntiguas() {
    try {
      const fechaLimite = new Date();
      fechaLimite.setHours(fechaLimite.getHours() - 48);

      const eliminados = await PeticionProcesada.destroy({
        where: {
          created_at: {
            [Op.lt]: fechaLimite
          }
        }
      });

      if (eliminados > 0) {
        console.log(`[CLEANUP] Limpieza de peticiones completada. Registros de idempotencia eliminados: ${eliminados}`);
      }
    } catch (error) {
      console.error('[ERROR CLEANUP] Error al limpiar la tabla peticiones_procesadas:', error);
    }
  }

  /**
   * Inicializa las tareas programadas y asegura la configuración base.
   */
  async init() {
    try {
      // 1. Asegurar que la tabla de configuración exista
      await SaaSConfig.sync();

      // =========================
      // TEST INMEDIATO
      // =========================
      console.log('[TEST] Ejecutando cleanup inmediato...');
      await this.limpiarPeticionesAntiguas();
      console.log('[TEST] Cleanup inmediato terminado');
      // =========================

      // JOB: Peticiones se ejecuta a las 00:00 todos los días
      cron.schedule('0 0 * * *', () => {
        this.limpiarPeticionesAntiguas();
      }, { timezone: "America/Managua" });

      console.log('✔ Cron Jobs de limpieza inicializados');

    } catch (error) {
      console.error('[ERROR CLEANUP]', error);
    }
  }
}

export default new CleanupService();
