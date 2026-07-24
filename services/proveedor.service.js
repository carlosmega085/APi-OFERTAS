import { Proveedor } from '../models/index.js';

class ProveedorService {
  /**
   * Crea un nuevo proveedor verificado en el sistema (anclado al tenant global = 1)
   */
  async crearProveedor(data) {
    return await Proveedor.create({
      empresa_id: 1, // Vinculado al tenant administrador/global por defecto
      nombre: data.nombre,
      rnc: data.rnc || null,
      telefono: data.telefono || null,
      email: data.email || null,
      direccion: data.direccion || null,
      estado: data.estado || 'activo'
    });
  }

  /**
   * Obtiene la lista de proveedores verificados activos
   */
  async obtenerProveedores() {
    return await Proveedor.findAll({
      where: { estado: 'activo' },
      order: [['nombre', 'ASC']]
    });
  }

  /**
   * Obtiene el detalle de un proveedor por ID
   */
  async obtenerProveedorPorId(id) {
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      throw new Error('Proveedor no encontrado.');
    }
    return proveedor;
  }

  /**
   * Actualiza los datos de un proveedor verificado
   */
  async actualizarProveedor(id, data) {
    const proveedor = await this.obtenerProveedorPorId(id);
    return await proveedor.update(data);
  }

  /**
   * Desactiva (eliminación lógica) un proveedor del catálogo
   */
  async desactivarProveedor(id) {
    const proveedor = await this.obtenerProveedorPorId(id);
    return await proveedor.update({ estado: 'inactivo' });
  }
}

export default new ProveedorService();
