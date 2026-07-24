import { sequelize, Empresa, EmpresaPerfil, Usuario, Consultor, Auditor } from '../models/index.js';
import directorioService from '../services/directorio.service.js';

const runTest = async () => {
  console.log('🚀 Iniciando pruebas de integración para el Directorio Compartido...');

  const suffix = Date.now();
  let createdUserIds = [];
  let createdEmpresaIds = [];
  let createdPerfilIds = [];
  let createdConsultorIds = [];
  let createdAuditorIds = [];

  const transaction = await sequelize.transaction();
  try {
    // 1. Crear Empresas (Tenants)
    console.log('1. Creando Empresas de prueba...');
    const empresaAprobada = await Empresa.create({ nombre: 'Empresa Demo Aprobada ' + suffix }, { transaction });
    const empresaPendiente = await Empresa.create({ nombre: 'Empresa Demo Pendiente ' + suffix }, { transaction });
    createdEmpresaIds.push(empresaAprobada.id, empresaPendiente.id);

    // 2. Crear Usuarios representantes
    const userEmpresaAprobada = await Usuario.create({
      empresa_id: empresaAprobada.id,
      nombre: 'Representante Aprobado ' + suffix,
      username: 'rep_aprobado_' + suffix,
      email: `rep_aprobado_${suffix}@test.com`,
      password: 'password123',
      rol: 'empresa'
    }, { transaction });

    const userEmpresaPendiente = await Usuario.create({
      empresa_id: empresaPendiente.id,
      nombre: 'Representante Pendiente ' + suffix,
      username: 'rep_pendiente_' + suffix,
      email: `rep_pendiente_${suffix}@test.com`,
      password: 'password123',
      rol: 'empresa'
    }, { transaction });
    createdUserIds.push(userEmpresaAprobada.id, userEmpresaPendiente.id);

    // 3. Crear Perfiles de Empresa (Aprobado y Pendiente)
    const perfilAprobado = await EmpresaPerfil.create({
      empresa_id: empresaAprobada.id,
      usuario_id: userEmpresaAprobada.id,
      razon_social: 'Empresa Demo Aprobada S.A.',
      rup: 'RUP-DEMO-APROBADO-' + suffix,
      representante_nombre: 'Representante Aprobado',
      representante_telefono: '88888888',
      representante_correo: userEmpresaAprobada.email,
      estado_perfil: 'aprobado'
    }, { transaction });

    const perfilPendiente = await EmpresaPerfil.create({
      empresa_id: empresaPendiente.id,
      usuario_id: userEmpresaPendiente.id,
      razon_social: 'Empresa Demo Pendiente S.A.',
      rup: 'RUP-DEMO-PENDIENTE-' + suffix,
      representante_nombre: 'Representante Pendiente',
      representante_telefono: '99999999',
      representante_correo: userEmpresaPendiente.email,
      estado_perfil: 'pendiente'
    }, { transaction });
    createdPerfilIds.push(perfilAprobado.id, perfilPendiente.id);

    // 4. Crear Consultores (Aprobado y Pendiente)
    console.log('2. Creando Consultores de prueba...');
    const userConsultorAprobado = await Usuario.create({
      empresa_id: 1, // Tenant global
      nombre: 'Consultor Aprobado ' + suffix,
      username: 'consultor_aprobado_' + suffix,
      email: `consultor_aprobado_${suffix}@test.com`,
      password: 'password123',
      rol: 'consultor'
    }, { transaction });

    const userConsultorPendiente = await Usuario.create({
      empresa_id: 1,
      nombre: 'Consultor Pendiente ' + suffix,
      username: 'consultor_pendiente_' + suffix,
      email: `consultor_pendiente_${suffix}@test.com`,
      password: 'password123',
      rol: 'consultor'
    }, { transaction });
    createdUserIds.push(userConsultorAprobado.id, userConsultorPendiente.id);

    const consultorAprobado = await Consultor.create({
      usuario_id: userConsultorAprobado.id,
      empresa_id: 1,
      cedula: 'CED-C-APR-' + suffix,
      correo: userConsultorAprobado.email,
      telefono: '77777777',
      cv_url: 'http://supabase.com/cv-apr.pdf',
      titulo_url: 'http://supabase.com/titulo-apr.pdf',
      estado_perfil: 'aprobado'
    }, { transaction });

    const consultorPendiente = await Consultor.create({
      usuario_id: userConsultorPendiente.id,
      empresa_id: 1,
      cedula: 'CED-C-PEN-' + suffix,
      correo: userConsultorPendiente.email,
      telefono: '66666666',
      cv_url: 'http://supabase.com/cv-pen.pdf',
      titulo_url: 'http://supabase.com/titulo-pen.pdf',
      estado_perfil: 'pendiente'
    }, { transaction });
    createdConsultorIds.push(consultorAprobado.id, consultorPendiente.id);

    // 5. Crear Auditores (Aprobado y Pendiente)
    console.log('3. Creando Auditores de prueba...');
    const userAuditorAprobado = await Usuario.create({
      empresa_id: 1,
      nombre: 'Auditor Aprobado ' + suffix,
      username: 'auditor_aprobado_' + suffix,
      email: `auditor_aprobado_${suffix}@test.com`,
      password: 'password123',
      rol: 'auditor'
    }, { transaction });

    const userAuditorPendiente = await Usuario.create({
      empresa_id: 1,
      nombre: 'Auditor Pendiente ' + suffix,
      username: 'auditor_pendiente_' + suffix,
      email: `auditor_pendiente_${suffix}@test.com`,
      password: 'password123',
      rol: 'auditor'
    }, { transaction });
    createdUserIds.push(userAuditorAprobado.id, userAuditorPendiente.id);

    const auditorAprobado = await Auditor.create({
      usuario_id: userAuditorAprobado.id,
      empresa_id: 1,
      cedula: 'CED-A-APR-' + suffix,
      correo: userAuditorAprobado.email,
      telefono: '55555555',
      cv_url: 'http://supabase.com/cv-apr.pdf',
      titulo_url: 'http://supabase.com/titulo-apr.pdf',
      estado_perfil: 'aprobado'
    }, { transaction });

    const auditorPendiente = await Auditor.create({
      usuario_id: userAuditorPendiente.id,
      empresa_id: 1,
      cedula: 'CED-A-PEN-' + suffix,
      correo: userAuditorPendiente.email,
      telefono: '44444444',
      cv_url: 'http://supabase.com/cv-pen.pdf',
      titulo_url: 'http://supabase.com/titulo-pen.pdf',
      estado_perfil: 'pendiente'
    }, { transaction });
    createdAuditorIds.push(auditorAprobado.id, auditorPendiente.id);

    await transaction.commit();
    console.log('   -> Datos de prueba inicializados y confirmados en la BD.');

    // 6. Consultar Directorio de Consultores
    console.log('4. Probando directorio de Consultores...');
    const consultores = await directorioService.listarConsultoresAprobados();
    const hasAprobadoC = consultores.some(c => c.id === consultorAprobado.id);
    const hasPendienteC = consultores.some(c => c.id === consultorPendiente.id);

    if (!hasAprobadoC) {
      throw new Error('FALLA: El consultor aprobado no figura en el directorio.');
    }
    if (hasPendienteC) {
      throw new Error('FALLA: Se retornó un consultor pendiente en el directorio.');
    }
    console.log('   -> Correcto: El directorio solo incluye consultores aprobados.');

    // Verificar exclusión de contraseña y campos críticos
    const sampleC = consultores.find(c => c.id === consultorAprobado.id);
    if (sampleC.Usuario.password) {
      throw new Error('FALLA DE SEGURIDAD: El hash de contraseña del usuario fue expuesto.');
    }
    console.log('   -> Correcto: Datos de usuario limpios y seguros.');

    // 7. Consultar Directorio de Empresas
    console.log('5. Probando directorio de Empresas...');
    const empresas = await directorioService.listarEmpresasAprobadas();
    const hasAprobadoE = empresas.some(e => e.id === perfilAprobado.id);
    const hasPendienteE = empresas.some(e => e.id === perfilPendiente.id);

    if (!hasAprobadoE) {
      throw new Error('FALLA: La empresa aprobada no figura en el directorio.');
    }
    if (hasPendienteE) {
      throw new Error('FALLA: Se retornó una empresa pendiente en el directorio.');
    }
    console.log('   -> Correcto: El directorio solo incluye empresas aprobadas.');

    // 8. Consultar Directorio de Auditores
    console.log('6. Probando directorio de Auditores...');
    const auditores = await directorioService.listarAuditoresAprobados();
    const hasAprobadoA = auditores.some(a => a.id === auditorAprobado.id);
    const hasPendienteA = auditores.some(a => a.id === auditorPendiente.id);

    if (!hasAprobadoA) {
      throw new Error('FALLA: El auditor aprobado no figura en el directorio.');
    }
    if (hasPendienteA) {
      throw new Error('FALLA: Se retornó un auditor pendiente en el directorio.');
    }
    console.log('   -> Correcto: El directorio solo incluye auditores aprobados.');

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DEL DIRECTORIO PASARON EXITOSAMENTE! 🎉');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
    console.error(error);
  } finally {
    // Limpieza de datos creados para no contaminar
    console.log('\n🔄 Limpiando datos de prueba creados...');
    try {
      const cleanTransaction = await sequelize.transaction();
      
      // Eliminar perfiles
      if (createdConsultorIds.length) {
        await Consultor.destroy({ where: { id: createdConsultorIds }, transaction: cleanTransaction });
      }
      if (createdAuditorIds.length) {
        await Auditor.destroy({ where: { id: createdAuditorIds }, transaction: cleanTransaction });
      }
      if (createdPerfilIds.length) {
        await EmpresaPerfil.destroy({ where: { id: createdPerfilIds }, transaction: cleanTransaction });
      }
      // Eliminar usuarios
      if (createdUserIds.length) {
        await Usuario.destroy({ where: { id: createdUserIds }, transaction: cleanTransaction });
      }
      // Eliminar empresas
      if (createdEmpresaIds.length) {
        await Empresa.destroy({ where: { id: createdEmpresaIds }, transaction: cleanTransaction });
      }

      await cleanTransaction.commit();
      console.log('   -> Limpieza completada.');
    } catch (cleanError) {
      console.error('❌ Error durante la limpieza de BD:', cleanError.message);
    }

    await sequelize.close();
  }
};

runTest();
