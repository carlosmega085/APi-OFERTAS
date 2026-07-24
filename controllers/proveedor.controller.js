import proveedorService from '../services/proveedor.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

class ProveedorController {
  // --- ENDPOINTS PÚBLICOS / DE CONSULTA ---
  async listarProveedores(req, res) {
    try {
      const proveedores = await proveedorService.obtenerProveedores();
      return sendSuccess(res, proveedores, 'Lista de proveedores verificados obtenida.');
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener los proveedores.');
    }
  }

  async obtenerProveedor(req, res) {
    try {
      const { id } = req.params;
      const proveedor = await proveedorService.obtenerProveedorPorId(id);
      return sendSuccess(res, proveedor, 'Detalle del proveedor obtenido.');
    } catch (error) {
      return sendError(res, error.message || 'Error al obtener el proveedor.');
    }
  }

  // --- ENDPOINTS ADMINISTRATIVOS ---
  async crearProveedor(req, res) {
    try {
      const proveedor = await proveedorService.crearProveedor(req.body);
      return sendSuccess(res, proveedor, 'Proveedor creado exitosamente en el catálogo global.', 201);
    } catch (error) {
      return sendError(res, error.message || 'Error al crear el proveedor.');
    }
  }

  async actualizarProveedor(req, res) {
    try {
      const { id } = req.params;
      const proveedor = await proveedorService.actualizarProveedor(id, req.body);
      return sendSuccess(res, proveedor, 'Proveedor actualizado exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al actualizar el proveedor.');
    }
  }

  async eliminarProveedor(req, res) {
    try {
      const { id } = req.params;
      await proveedorService.desactivarProveedor(id);
      return sendSuccess(res, null, 'Proveedor desactivado del catálogo global exitosamente.');
    } catch (error) {
      return sendError(res, error.message || 'Error al desactivar el proveedor.');
    }
  }
}

export default new ProveedorController();
