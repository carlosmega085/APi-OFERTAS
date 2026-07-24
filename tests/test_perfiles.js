import { sequelize, Empresa, EmpresaPerfil, Usuario, Consultor } from '../models/index.js';
import perfilService from '../services/perfil.service.js';

const runTest = async () => {
  console.log('🚀 Iniciando pruebas de integración del módulo de Perfiles...');

  const transaction = await sequelize.transaction();
  try {
    const suffix = Date.now();

    // 1. Crear Consultor de Prueba
    console.log('1. Creando Consultor y su cuenta de acceso...');
    const consultorUser = await Usuario.create({
      empresa_id: 1,
      nombre: 'Consultor Perfil',
      username: 'consultor_p_' + suffix,
      email: `c_p_${suffix}@test.com`,
      password: 'password123',
      rol: 'consultor'
    }, { transaction });

    const consultor = await Consultor.create({
      usuario_id: consultorUser.id,
      empresa_id: 1,
      cedula: 'CED-' + suffix,
      correo: consultorUser.email,
      telefono: '1111-1111',
      cv_url: 'http://docs.com/cv.pdf',
      titulo_url: 'http://docs.com/title.pdf',
      estado_perfil: 'aprobado' // Simulamos que ya fue aprobado por admin
    }, { transaction });

    // 2. Crear Empresa de Prueba
    console.log('2. Creando Empresa de prueba...');
    const empresa = await Empresa.create({ nombre: 'Empresa Perfil S.A.' }, { transaction });
    const empresaUser = await Usuario.create({
      empresa_id: empresa.id,
      nombre: 'Rep Original',
      username: 'empresa_p_' + suffix,
      email: `e_p_${suffix}@test.com`,
      password: 'password123',
      rol: 'empresa'
    }, { transaction });

    await EmpresaPerfil.create({
      empresa_id: empresa.id,
      usuario_id: empresaUser.id,
      razon_social: 'Empresa Perfil S.A.',
      rup: 'RUP-ORIGINAL',
      representante_nombre: 'Rep Original',
      representante_telefono: '2222-2222',
      representante_correo: empresaUser.email,
      estado_perfil: 'aprobado'
    }, { transaction });

    await transaction.commit();
    console.log('   -> Datos mock de prueba inicializados.');

    // 3. Consultar Perfil Propio
    console.log('3. Probando consulta de perfil propio (GET /me)...');
    const perfilGet = await perfilService.obtenerPerfil(consultorUser.id, 'consultor', 1);
    console.log(`   -> Consultor recuperado: ${perfilGet.usuario.nombre}, cédula: ${perfilGet.perfil.cedula}`);
    if (perfilGet.perfil.telefono !== '1111-1111') {
      throw new Error('FALLA: El número de teléfono no coincide.');
    }

    // 4. Actualización no crítica (Cambiar teléfono)
    console.log('4. Realizando actualización no crítica (Cambiar teléfono)...');
    const updateNoCritico = await perfilService.actualizarPerfil(
      consultorUser.id,
      'consultor',
      1,
      { telefono: '9999-9999' },
      {}
    );
    console.log(`   -> Nuevo teléfono: ${updateNoCritico.telefono}, Estado: ${updateNoCritico.estado_perfil}`);
    if (updateNoCritico.estado_perfil !== 'aprobado') {
      throw new Error('FALLA: Un cambio no crítico reseteó el estado del perfil.');
    }

    // 5. Actualización crítica (Cambiar Cédula)
    console.log('5. Realizando actualización crítica (Cambiar Cédula)...');
    const updateCritico = await perfilService.actualizarPerfil(
      consultorUser.id,
      'consultor',
      1,
      { cedula: 'CED-NEW-' + suffix },
      {}
    );
    console.log(`   -> Nueva cédula: ${updateCritico.cedula}, Estado: ${updateCritico.estado_perfil}`);
    if (updateCritico.estado_perfil !== 'pendiente') {
      throw new Error('FALLA: El cambio de cédula crítica no restableció el perfil a pendiente.');
    }
    console.log('   -> Correcto: Cambios críticos restablecen el perfil a "pendiente" para re-validación.');

    // 6. Actualización de Empresa y sincronización de Usuario
    console.log('6. Actualizando Empresa y validando sincronización de cuenta de representante...');
    const updateEmpresa = await perfilService.actualizarPerfil(
      empresaUser.id,
      'empresa',
      empresa.id,
      { 
        representante_nombre: 'Rep Modificado',
        representante_correo: `rep_mod_${suffix}@test.com`
      },
      {}
    );

    const userSincronizado = await Usuario.findByPk(empresaUser.id);
    console.log(`   -> Usuario synced -> Nombre: ${userSincronizado.nombre}, Email: ${userSincronizado.email}`);
    if (userSincronizado.nombre !== 'Rep Modificado' || userSincronizado.email !== `rep_mod_${suffix}@test.com`) {
      throw new Error('FALLA: Los datos modificados del representante de la empresa no se sincronizaron con su cuenta de Usuario.');
    }
    console.log('   -> Correcto: La cuenta del Usuario representante está sincronizada con el perfil de la empresa.');

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE PERFILES PASARON EXITOSAMENTE! 🎉');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
  } finally {
    await sequelize.close();
  }
};

runTest();
