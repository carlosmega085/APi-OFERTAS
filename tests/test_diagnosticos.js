import { sequelize, Empresa, EmpresaPerfil, Usuario, Consultor, Diagnostico, Recomendacion } from '../models/index.js';
import diagnosticoService from '../services/diagnostico.service.js';

const runTest = async () => {
  console.log('🚀 Iniciando pruebas de integración del módulo de Diagnósticos...');

  const transaction = await sequelize.transaction();
  try {
    // 1. Crear Empresa (Tenant) y Perfil de Prueba
    console.log('1. Creando Empresa de prueba...');
    const empresa = await Empresa.create({ nombre: 'Empresa Test S.A.' }, { transaction });
    
    const empresaUser = await Usuario.create({
      empresa_id: empresa.id,
      nombre: 'Rep Legal',
      username: 'replegal_' + Date.now(),
      email: `rep_${Date.now()}@test.com`,
      password: 'password123',
      rol: 'empresa'
    }, { transaction });

    await EmpresaPerfil.create({
      empresa_id: empresa.id,
      usuario_id: empresaUser.id,
      razon_social: 'Empresa Test S.A. Razón Social',
      rup: 'RUP-TEST-1234',
      representante_nombre: 'Rep Legal',
      representante_telefono: '12345678',
      representante_correo: empresaUser.email,
      estado_perfil: 'aprobado'
    }, { transaction });

    // 2. Crear Consultor de Prueba (Aprobado)
    console.log('2. Creando Consultor de prueba...');
    const consultorUser = await Usuario.create({
      empresa_id: 1, // Tenant global
      nombre: 'Ing. Consultor',
      username: 'consultor_' + Date.now(),
      email: `consultor_${Date.now()}@test.com`,
      password: 'password123',
      rol: 'consultor'
    }, { transaction });

    const consultor = await Consultor.create({
      usuario_id: consultorUser.id,
      empresa_id: 1,
      cedula: 'CED-' + Date.now(),
      correo: consultorUser.email,
      telefono: '88888888',
      cv_url: 'http://supabase.com/cv.pdf',
      titulo_url: 'http://supabase.com/titulo.pdf',
      estado_perfil: 'aprobado'
    }, { transaction });

    await transaction.commit();

    console.log('   -> Empresa y Consultor creados con éxito.');

    // 3. Crear Diagnóstico en Borrador (Uso de servicios)
    console.log('3. Creando diagnóstico en borrador...');
    const diag = await diagnosticoService.crearDiagnostico(consultorUser.id, {
      empresa_id: empresa.id,
      observaciones: 'Evaluación inicial del establecimiento',
      estado: 'borrador'
    });
    console.log(`   -> Diagnóstico creado con ID: ${diag.id}, estado: ${diag.estado}`);

    // 4. Verificar visibilidad para la Empresa (Debe lanzar error o no listarse)
    console.log('4. Verificando que la empresa NO tenga visible el borrador...');
    const diagsEmpresaBorrador = await diagnosticoService.listarDiagnosticos(empresaUser.id, 'empresa', empresa.id);
    const visibleEnBorrador = diagsEmpresaBorrador.some(d => d.id === diag.id);
    if (visibleEnBorrador) {
      throw new Error('FALLA: El diagnóstico en borrador es visible para la empresa.');
    }
    console.log('   -> Correcto: La empresa no puede listar diagnósticos en borrador.');

    // 5. Agregar Recomendación en bloque
    console.log('5. Agregando recomendaciones en bloque...');
    const recomendaciones = [
      {
        tipo_sugerencia: 'equipo',
        descripcion: 'Instalar extractor de aire en cocina industrial',
        norma_asociada: 'RTCA Inocuidad Alimentos'
      },
      {
        tipo_sugerencia: 'servicio',
        descripcion: 'Realizar calibración anual de termómetros',
        norma_asociada: 'HACCP Calibración'
      }
    ];

    const sugerenciasCreadas = await diagnosticoService.agregarRecomendaciones(consultorUser.id, diag.id, recomendaciones);
    console.log(`   -> Se agregaron ${sugerenciasCreadas.length} recomendaciones con éxito.`);

    // 6. Finalizar Diagnóstico
    console.log('6. Finalizando el diagnóstico...');
    await diagnosticoService.finalizarDiagnostico(consultorUser.id, diag.id);
    
    const diagFinal = await diagnosticoService.obtenerDiagnosticoPorId(consultorUser.id, 'consultor', null, diag.id);
    console.log(`   -> Estado del diagnóstico actualizado a: ${diagFinal.estado}`);
    if (diagFinal.estado !== 'finalizado') {
      throw new Error('FALLA: El diagnóstico no cambió su estado a finalizado.');
    }

    // 7. Verificar visibilidad para la Empresa tras finalizar
    console.log('7. Verificando visibilidad para la empresa tras finalizar...');
    const diagsEmpresaFinal = await diagnosticoService.listarDiagnosticos(empresaUser.id, 'empresa', empresa.id);
    const visibleEnFinal = diagsEmpresaFinal.some(d => d.id === diag.id);
    if (!visibleEnFinal) {
      throw new Error('FALLA: El diagnóstico finalizado no es visible para la empresa.');
    }
    console.log('   -> Correcto: La empresa puede listar el diagnóstico finalizado.');

    const detalleEmpresa = await diagnosticoService.obtenerDiagnosticoPorId(empresaUser.id, 'empresa', empresa.id, diag.id);
    console.log(`   -> Detalle obtenido por la empresa. Recomendaciones asociadas: ${detalleEmpresa.recomendaciones.length}`);
    if (detalleEmpresa.recomendaciones.length !== 2) {
      throw new Error('FALLA: La empresa no puede leer las recomendaciones enlazadas.');
    }

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE INTEGRACIÓN PASARON EXITOSAMENTE! 🎉');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
  } finally {
    await sequelize.close();
  }
};

runTest();
