import { 
  Empresa, 
  Usuario, 
  EmpresaPerfil, 
  Consultor, 
  Auditor, 
  Diagnostico, 
  Recomendacion, 
  Proveedor 
} from '../models/index.js';

class DashboardService {
  async getDashboardData(userId, rol, empresaId) {
    switch (rol) {
      case 'empresa':
        return await this._getEmpresaDashboard(userId, empresaId);
      case 'consultor':
        return await this._getConsultorDashboard(userId);
      case 'auditor':
        return await this._getAuditorDashboard(userId);
      case 'admin':
        return await this._getAdminDashboard();
      default:
        throw new Error('Rol no reconocido para el dashboard');
    }
  }

  // --- DASHBOARD EMPRESA ---
  async _getEmpresaDashboard(userId, empresaId) {
    const perfil = await EmpresaPerfil.findOne({ 
      where: { empresa_id: empresaId } 
    });

    const totalDiagnosticos = await Diagnostico.count({ 
      where: { empresa_id: empresaId } 
    });

    // Último diagnóstico finalizado para obtener la calificación actual
    const ultimoFinalizado = await Diagnostico.findOne({
      where: { empresa_id: empresaId, estado: 'finalizado' },
      order: [['updated_at', 'DESC']]
    });

    // Diagnósticos recientes
    const diagnosticosRecientes = await Diagnostico.findAll({
      where: { empresa_id: empresaId },
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Consultor,
          include: [{ model: Usuario, attributes: ['nombre'] }]
        }
      ]
    });

    // Recomendaciones activas
    const recomendaciones = await Recomendacion.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Diagnostico,
          where: { empresa_id: empresaId },
          attributes: ['id', 'created_at']
        },
        {
          model: Proveedor,
          as: 'Proveedor',
          attributes: ['nombre', 'telefono', 'email']
        }
      ]
    });

    const totalRecomendaciones = await Recomendacion.count({
      include: [{
        model: Diagnostico,
        where: { empresa_id: empresaId }
      }]
    });

    return {
      perfil: perfil ? {
        razon_social: perfil.razon_social,
        rup: perfil.rup,
        representante_nombre: perfil.representante_nombre,
        tipo_servicio: perfil.tipo_servicio,
        logo_url: perfil.logo_url,
        estado_perfil: perfil.estado_perfil
      } : null,
      kpis: {
        score_cumplimiento: ultimoFinalizado ? parseFloat(ultimoFinalizado.puntaje_cumplimiento) : 0.00,
        diagnosticos_realizados: totalDiagnosticos,
        recomendaciones_recibidas: totalRecomendaciones
      },
      diagnosticos_recientes: diagnosticosRecientes,
      recomendaciones_sugeridas: recomendaciones
    };
  }

  // --- DASHBOARD CONSULTOR ---
  async _getConsultorDashboard(userId) {
    const consultor = await Consultor.findOne({ 
      where: { usuario_id: userId } 
    });

    if (!consultor) {
      throw new Error('Perfil de consultor no encontrado para este usuario');
    }

    // Cantidad de empresas diferentes diagnosticadas/en diagnóstico
    const uniqueEmpresas = await Diagnostico.count({
      distinct: true,
      col: 'empresa_id',
      where: { consultor_id: consultor.id }
    });

    const completados = await Diagnostico.count({
      where: { consultor_id: consultor.id, estado: 'finalizado' }
    });

    const borradores = await Diagnostico.count({
      where: { consultor_id: consultor.id, estado: 'borrador' }
    });

    // Diagnósticos recientes redactados por el consultor
    const diagnosticosRecientes = await Diagnostico.findAll({
      where: { consultor_id: consultor.id },
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: Empresa, attributes: ['id', 'nombre'] }
      ]
    });

    return {
      perfil: {
        id: consultor.id,
        cedula: consultor.cedula,
        correo: consultor.correo,
        telefono: consultor.telefono,
        estado_perfil: consultor.estado_perfil
      },
      kpis: {
        empresas_atendidas: uniqueEmpresas,
        diagnosticos_completados: completados,
        diagnosticos_en_borrador: borradores
      },
      diagnosticos_recientes: diagnosticosRecientes
    };
  }

  // --- DASHBOARD AUDITOR ---
  async _getAuditorDashboard(userId) {
    const auditor = await Auditor.findOne({ 
      where: { usuario_id: userId } 
    });

    if (!auditor) {
      throw new Error('Perfil de auditor no encontrado para este usuario');
    }

    // Diagnósticos/Auditorías asistidas (observador/shadow)
    const totalAsistidas = await Diagnostico.count({
      where: { auditor_id: auditor.id }
    });

    const auditoriasShadow = await Diagnostico.findAll({
      where: { auditor_id: auditor.id },
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: Empresa, attributes: ['id', 'nombre'] },
        { 
          model: Consultor, 
          include: [{ model: Usuario, attributes: ['nombre'] }] 
        }
      ]
    });

    return {
      perfil: {
        id: auditor.id,
        cedula: auditor.cedula,
        correo: auditor.correo,
        telefono: auditor.telefono,
        estado_perfil: auditor.estado_perfil
      },
      kpis: {
        auditorias_asistidas: totalAsistidas
      },
      auditorias_shadow_recientes: auditoriasShadow
    };
  }

  // --- DASHBOARD ADMIN ---
  async _getAdminDashboard() {
    const totalEmpresas = await EmpresaPerfil.count();
    const totalConsultores = await Consultor.count();
    const totalAuditores = await Auditor.count();

    const empresasPendientes = await EmpresaPerfil.count({ where: { estado_perfil: 'pendiente' } });
    const consultoresPendientes = await Consultor.count({ where: { estado_perfil: 'pendiente' } });
    const auditoresPendientes = await Auditor.count({ where: { estado_perfil: 'pendiente' } });

    return {
      kpis: {
        total_empresas: totalEmpresas,
        total_consultores: totalConsultores,
        total_auditores: totalAuditores,
        total_pendientes: empresasPendientes + consultoresPendientes + auditoresPendientes
      },
      pendientes_validacion: {
        empresas: empresasPendientes,
        consultores: consultoresPendientes,
        auditores: auditoresPendientes
      }
    };
  }
}

export default new DashboardService();
