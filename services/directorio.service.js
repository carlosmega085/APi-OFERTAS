import { Consultor, Auditor, EmpresaPerfil, Usuario, Empresa } from '../models/index.js';

class DirectorioService {
  /**
   * Obtiene la lista de consultores aprobados con sus perfiles públicos.
   */
  async listarConsultoresAprobados() {
    return await Consultor.findAll({
      where: { estado_perfil: 'aprobado' },
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'username', 'email', 'estado']
        }
      ],
      attributes: [
        'id',
        'usuario_id',
        'empresa_id',
        'correo',
        'telefono',
        'cv_url',
        'titulo_url',
        'maestria_url',
        'foto_url',
        'estado_perfil',
        'created_at'
      ],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Obtiene la lista de empresas aprobadas con sus perfiles públicos.
   */
  async listarEmpresasAprobadas() {
    return await EmpresaPerfil.findAll({
      where: { estado_perfil: 'aprobado' },
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'username', 'email']
        },
        {
          model: Empresa,
          attributes: ['id', 'nombre', 'estado']
        }
      ],
      attributes: [
        'id',
        'empresa_id',
        'usuario_id',
        'razon_social',
        'rup',
        'descripcion',
        'representante_nombre',
        'representante_telefono',
        'representante_correo',
        'tipo_servicio',
        'logo_url',
        'estado_perfil',
        'created_at'
      ],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Obtiene la lista de auditores aprobados con sus perfiles públicos.
   */
  async listarAuditoresAprobados() {
    return await Auditor.findAll({
      where: { estado_perfil: 'aprobado' },
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'username', 'email', 'estado']
        }
      ],
      attributes: [
        'id',
        'usuario_id',
        'empresa_id',
        'correo',
        'telefono',
        'cv_url',
        'titulo_url',
        'capacitacion_url',
        'foto_url',
        'estado_perfil',
        'created_at'
      ],
      order: [['created_at', 'DESC']]
    });
  }
}

export default new DirectorioService();
