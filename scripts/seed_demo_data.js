import { 
  sequelize, 
  Empresa, 
  Plan, 
  Suscripcion, 
  Usuario, 
  Tienda, 
  EmpresaPerfil, 
  Consultor, 
  Auditor, 
  Proveedor, 
  Diagnostico, 
  Recomendacion, 
  Conversacion, 
  Mensaje 
} from '../models/index.js';

const seedDemoData = async () => {
  try {
    console.log('🔄 Iniciando la carga de datos de prueba para la API...');

    // 1. Asegurar existencia de Planes
    console.log('1. Creando planes...');
    const planesExistentes = await Plan.count();
    let planes = [];
    if (planesExistentes === 0) {
      planes = await Plan.bulkCreate([
        {
          id: 1,
          nombre: 'Bronce (Básico)',
          precio: 25.00,
          limite_usuarios: 3,
          limite_tiendas: 1,
          limite_productos: 150,
          limite_variantes_por_p: 10,
          max_vendedores_por_tienda: 1,
          permite_fotos: false
        },
        {
          id: 2,
          nombre: 'Plata (Pro)',
          precio: 59.99,
          limite_usuarios: 15,
          limite_tiendas: 3,
          limite_productos: 300,
          limite_variantes_por_p: 20,
          max_vendedores_por_tienda: 5,
          permite_fotos: true
        },
        {
          id: 3,
          nombre: 'Oro (Empresarial)',
          precio: 99.99,
          limite_usuarios: 50,
          limite_tiendas: 10,
          limite_productos: 1000,
          limite_variantes_por_p: 50,
          max_vendedores_por_tienda: 10,
          permite_fotos: true
        }
      ]);
    } else {
      planes = await Plan.findAll();
    }
    console.log(`   -> ${planes.length} planes listos.`);

    // 2. Crear Empresas (Tenant Global y Cliente)
    console.log('2. Creando empresas (tenants)...');
    
    // Tenant Global (obligatorio para perfiles globales y admin)
    const [empresaGlobal] = await Empresa.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'Plataforma Global Certificaciones',
        estado: 'activo'
      }
    });

    // Tenant Cliente
    const [empresaCliente] = await Empresa.findOrCreate({
      where: { id: 2 },
      defaults: {
        nombre: 'Alimentos del Valle S.A.',
        estado: 'activo'
      }
    });
    console.log('   -> Empresas creadas (Tenant 1 y Tenant 2).');

    // 3. Crear Usuarios de prueba (contraseña: 12345)
    console.log('3. Creando cuentas de usuario...');
    
    // Admin General de la Plataforma
    const [userAdmin] = await Usuario.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        empresa_id: 1,
        nombre: 'Administrador General',
        email: 'admin@plataforma.com',
        password: '12345',
        rol: 'admin',
        estado: 'activo'
      }
    });

    // Representante de la Empresa Cliente (Tenant 2)
    const [userEmpresa] = await Usuario.findOrCreate({
      where: { username: 'empresa' },
      defaults: {
        empresa_id: 2,
        nombre: 'Carlos Valle',
        email: 'carlos@alimentosvalle.com',
        password: '12345',
        rol: 'empresa',
        estado: 'activo'
      }
    });

    // Consultor Certificado (Tenant 1, global)
    const [userConsultor] = await Usuario.findOrCreate({
      where: { username: 'consultor' },
      defaults: {
        empresa_id: 1,
        nombre: 'Dra. María Luján',
        email: 'maria.lujan@consultoria.com',
        password: '12345',
        rol: 'consultor',
        estado: 'activo'
      }
    });

    // Auditor en Formación (Tenant 1, global)
    const [userAuditor] = await Usuario.findOrCreate({
      where: { username: 'auditor' },
      defaults: {
        empresa_id: 1,
        nombre: 'Juan Pérez',
        email: 'juan.perez@auditor.com',
        password: '12345',
        rol: 'auditor',
        estado: 'activo'
      }
    });

    // Vendedor/Empleado de la Empresa (Tenant 2)
    const [userVendedor] = await Usuario.findOrCreate({
      where: { username: 'vendedor' },
      defaults: {
        empresa_id: 2,
        nombre: 'Ana Gómez',
        email: 'ana.gomez@alimentosvalle.com',
        password: '12345',
        rol: 'vendedor',
        estado: 'activo'
      }
    });

    console.log('   -> Cuentas de usuario creadas (Contraseña común: "12345").');

    // 4. Crear Perfil de Empresa
    console.log('4. Creando perfil de empresa cliente...');
    const [perfilEmpresa] = await EmpresaPerfil.findOrCreate({
      where: { empresa_id: 2 },
      defaults: {
        usuario_id: userEmpresa.id,
        razon_social: 'Alimentos del Valle S.A. de C.V.',
        rup: 'RUP-ALVALLE-2026',
        descripcion: 'Planta procesadora de embutidos y alimentos empacados.',
        representante_nombre: 'Carlos Valle',
        representante_telefono: '+506 8888-7777',
        representante_correo: 'carlos@alimentosvalle.com',
        programa_requisitos: 'Implementando HACCP y BPM en salas de corte.',
        tipo_servicio: 'Certificación Higiénico-Sanitaria A',
        estado_perfil: 'aprobado'
      }
    });

    // 5. Crear Perfil de Consultor
    console.log('5. Creando perfil de consultor...');
    const [perfilConsultor] = await Consultor.findOrCreate({
      where: { usuario_id: userConsultor.id },
      defaults: {
        empresa_id: 1,
        cedula: '1-0852-0963',
        correo: 'maria.lujan@consultoria.com',
        telefono: '+506 8765-4321',
        cv_url: 'https://mvfvdmpwcyobuttsuqxz.supabase.co/storage/v1/object/public/comprobantes/cv_lujan.pdf',
        titulo_url: 'https://mvfvdmpwcyobuttsuqxz.supabase.co/storage/v1/object/public/comprobantes/titulo_lujan.pdf',
        estado_perfil: 'aprobado'
      }
    });

    // 6. Crear Perfil de Auditor
    console.log('6. Creando perfil de auditor...');
    const [perfilAuditor] = await Auditor.findOrCreate({
      where: { usuario_id: userAuditor.id },
      defaults: {
        empresa_id: 1,
        cedula: '1-1593-0753',
        correo: 'juan.perez@auditor.com',
        telefono: '+506 7012-3456',
        cv_url: 'https://mvfvdmpwcyobuttsuqxz.supabase.co/storage/v1/object/public/comprobantes/cv_perez.pdf',
        titulo_url: 'https://mvfvdmpwcyobuttsuqxz.supabase.co/storage/v1/object/public/comprobantes/titulo_perez.pdf',
        estado_perfil: 'aprobado'
      }
    });

    console.log('   -> Perfiles de Empresa, Consultor y Auditor aprobados.');

    // 7. Crear Tienda (Establecimiento/Sucursal)
    console.log('7. Creando establecimientos/sucursales...');
    const [tienda] = await Tienda.findOrCreate({
      where: { nombre: 'Planta Central Heredia' },
      defaults: {
        empresa_id: 2,
        direccion: '300m Oeste de la Iglesia de San Joaquín, Heredia',
        estado: 'activo'
      }
    });

    // Asignar el vendedor a la tienda creada
    await userVendedor.update({ tienda_id: tienda.id });
    console.log(`   -> Establecimiento creado y vendedor asignado a Tienda ID: ${tienda.id}`);

    // 8. Crear Suscripción para la Empresa
    console.log('8. Creando suscripción a Plan...');
    const [suscripcion] = await Suscripcion.findOrCreate({
      where: { empresa_id: 2 },
      defaults: {
        plan_id: 2, // Plan Plata (Pro)
        estado: 'activa',
        referencia_pago: 'TRANS-987654321',
        imagen_pago: 'https://mvfvdmpwcyobuttsuqxz.supabase.co/storage/v1/object/public/comprobantes/comprobante_valle.png',
        fecha_inicio: new Date(),
        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        estado_registro: 'activo'
      }
    });
    console.log('   -> Suscripción activa creada.');

    // 9. Crear Proveedores Verificados
    console.log('9. Creando proveedores verificados...');
    const [prov1] = await Proveedor.findOrCreate({
      where: { nombre: 'Equipos Industriales del Norte' },
      defaults: {
        empresa_id: 1, // Global
        rnc: 'RNC-101234567',
        telefono: '2244-8899',
        email: 'ventas@equiposnorte.com',
        direccion: 'San José, Paseo Colón',
        estado: 'activo'
      }
    });

    const [prov2] = await Proveedor.findOrCreate({
      where: { nombre: 'Insumos Químicos de Limpieza S.A.' },
      defaults: {
        empresa_id: 1, // Global
        rnc: 'RNC-202345678',
        telefono: '2233-4455',
        email: 'soporte@insumosquimicos.com',
        direccion: 'Alajuela, Parque Industrial El Coyol',
        estado: 'activo'
      }
    });
    console.log('   -> Proveedores creados.');

    // 10. Crear Diagnóstico (Finalizado)
    console.log('10. Creando diagnóstico...');
    const [diagnostico] = await Diagnostico.findOrCreate({
      where: { empresa_id: 2, consultor_id: perfilConsultor.id },
      defaults: {
        auditor_id: perfilAuditor.id,
        puntaje_cumplimiento: 78.50,
        observaciones: 'El establecimiento cuenta con buenas prácticas de manufactura en un 80%, sin embargo se requiere mejorar la ventilación en la sala de cocción principal e implementar el etiquetado correcto de reactivos químicos.',
        estado: 'finalizado'
      }
    });
    console.log(`    -> Diagnóstico creado con ID: ${diagnostico.id}`);

    // 11. Agregar Recomendaciones asociadas al Diagnóstico
    console.log('11. Creando recomendaciones...');
    const recomCount = await Recomendacion.count({ where: { diagnostico_id: diagnostico.id } });
    if (recomCount === 0) {
      await Recomendacion.bulkCreate([
        {
          diagnostico_id: diagnostico.id,
          tipo_sugerencia: 'equipo',
          descripcion: 'Instalar extractor de aire tipo campana industrial de acero inoxidable en la sala de cocción principal.',
          norma_asociada: 'RTCA 67.01.33:06 Inocuidad (Instalaciones)',
          proveedor_id: prov1.id,
          estado_seguimiento: 'pendiente'
        },
        {
          diagnostico_id: diagnostico.id,
          tipo_sugerencia: 'insumo',
          descripcion: 'Implementar el kit de rotulación y dispensadores cerrados para reactivos químicos de limpieza.',
          norma_asociada: 'SGA Etiquetado de Químicos',
          proveedor_id: prov2.id,
          estado_seguimiento: 'pendiente'
        }
      ]);
    }
    console.log('    -> Recomendaciones agregadas.');

    // 12. Crear Conversación y Mensaje entre Consultor y Empresa
    console.log('12. Inicializando chat de soporte...');
    const [conversacion] = await Conversacion.findOrCreate({
      where: {
        usuario1_id: userConsultor.id,
        usuario2_id: userEmpresa.id
      }
    });

    const msgCount = await Mensaje.count({ where: { conversacion_id: conversacion.id } });
    if (msgCount === 0) {
      await Mensaje.bulkCreate([
        {
          conversacion_id: conversacion.id,
          emisor_id: userConsultor.id,
          contenido: 'Hola Carlos, ya he subido los resultados del diagnóstico. Puedes ver las recomendaciones en la plataforma.'
        },
        {
          conversacion_id: conversacion.id,
          emisor_id: userEmpresa.id,
          contenido: 'Excelente Dra. Luján, ya los reviso y cotizo los extractores con el proveedor sugerido.'
        }
      ]);
    }
    console.log('    -> Conversación y mensajes de prueba insertados.');

    console.log('🎉 Carga de datos de prueba finalizada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

seedDemoData();
