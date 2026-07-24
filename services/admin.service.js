import { EmpresaPerfil, Consultor, Auditor, Usuario, Empresa } from '../models/index.js';

class AdminService {
  // --- LISTAR PERFILES ---

  async getEmpresas(filter = {}) {
    const where = {};
    if (filter.estado_perfil) {
      where.estado_perfil = filter.estado_perfil;
    }

    return await EmpresaPerfil.findAll({
      where,
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'username', 'email', 'rol', 'estado']
        },
        {
          model: Empresa,
          attributes: ['id', 'nombre', 'estado']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async getConsultores(filter = {}) {
    const where = {};
    if (filter.estado_perfil) {
      where.estado_perfil = filter.estado_perfil;
    }

    return await Consultor.findAll({
      where,
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'username', 'email', 'rol', 'estado']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async getAuditores(filter = {}) {
    const where = {};
    if (filter.estado_perfil) {
      where.estado_perfil = filter.estado_perfil;
    }

    return await Auditor.findAll({
      where,
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'username', 'email', 'rol', 'estado']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  // --- VALIDAR PERFILES (APROBAR/RECHAZAR) ---

  async validarEmpresa(id, estado_perfil) {
    if (!['aprobado', 'rechazado'].includes(estado_perfil)) {
      throw new Error('Estado de validación no válido. Debe ser aprobado o rechazado.');
    }

    const perfil = await EmpresaPerfil.findByPk(id);
    if (!perfil) throw new Error('Perfil de empresa no encontrado');

    await perfil.update({ estado_perfil });
    return perfil;
  }

  async validarConsultor(id, estado_perfil) {
    if (!['aprobado', 'rechazado'].includes(estado_perfil)) {
      throw new Error('Estado de validación no válido. Debe ser aprobado o rechazado.');
    }

    const perfil = await Consultor.findByPk(id);
    if (!perfil) throw new Error('Perfil de consultor no encontrado');

    await perfil.update({ estado_perfil });
    return perfil;
  }

  async validarAuditor(id, estado_perfil) {
    if (!['aprobado', 'rechazado'].includes(estado_perfil)) {
      throw new Error('Estado de validación no válido. Debe ser aprobado o rechazado.');
    }

    const perfil = await Auditor.findByPk(id);
    if (!perfil) throw new Error('Perfil de auditor en formación no encontrado');

    await perfil.update({ estado_perfil });
    return perfil;
  }
}

export default new AdminService();
