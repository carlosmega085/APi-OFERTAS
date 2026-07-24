import diagnosticoService from '../services/diagnostico.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class DiagnosticoController {
  async crearDiagnostico(req, res) {
    try {
      const diagnostico = await diagnosticoService.crearDiagnostico(req.user.id, req.body);
      return sendSuccess(res, diagnostico, 'Diagnóstico creado exitosamente.', 201);
    } catch (error) {
      return sendError(res, error.message || 'Error al crear el diagnóstico.');
    }
  }

  async agregarRecomendaciones(req, res) {
    try {
      const { id } = req.params;
      const { recomendaciones } = req.body;
      const creadas = await diagnosticoService.agregarRecomendaciones(req.user.id, id, recomendaciones);
      return sendSuccess(res, creadas, 'Recomendaciones agregadas exitosamente.', 201);
    } catch (error) {
      return sendError(res, error.message || 'Error al agregar recomendaciones.');
    }
  }

  async listarDiagnosticos(req, res) {
    try {
      const { id, rol, empresa_id } = req.user;
      const diagnosticos = await diagnosticoService.listarDiagnosticos(id, rol, empresa_id);
      return sendSuccess(res, diagnosticos, 'Diagnósticos obtenidos exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al listar diagnósticos.');
    }
  }

  async obtenerDiagnostico(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const diagnostico = await diagnosticoService.obtenerDiagnosticoPorId(
        user.id, 
        user.rol, 
        user.empresa_id, 
        id
      );
      return sendSuccess(res, diagnostico, 'Detalle del diagnóstico obtenido.');
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener el diagnóstico.');
    }
  }

  async finalizarDiagnostico(req, res) {
    try {
      const { id } = req.params;
      const diagnostico = await diagnosticoService.finalizarDiagnostico(req.user.id, id);
      return sendSuccess(res, diagnostico, 'Diagnóstico finalizado exitosamente. Ahora es visible para la empresa.');
    } catch (error) {
      return sendError(res, error.message || 'Error al finalizar el diagnóstico.');
    }
  }

  async firmarDiagnostico(req, res) {
    try {
      const { id } = req.params;
      const { id: userId, rol, empresa_id } = req.user;
      const diagnostico = await diagnosticoService.firmarDiagnostico(userId, rol, empresa_id, id, req.body);
      return sendSuccess(res, diagnostico, 'Diagnóstico firmado y aceptado exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al firmar el diagnóstico.');
    }
  }

  async actualizarSeguimientoRecomendacion(req, res) {
    try {
      const { recomendacionId } = req.params;
      const { id: userId, rol, empresa_id } = req.user;
      const file = req.file; // Proveniente de multer
      const recomendacion = await diagnosticoService.actualizarSeguimientoRecomendacion(
        userId,
        rol,
        empresa_id,
        recomendacionId,
        req.body,
        file
      );
      return sendSuccess(res, recomendacion, 'Seguimiento de recomendación actualizado exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al actualizar el seguimiento de la recomendación.');
    }
  }
}

export default new DiagnosticoController();
