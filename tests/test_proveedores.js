import { sequelize, Proveedor } from '../models/index.js';
import proveedorService from '../services/proveedor.service.js';

const runTest = async () => {
  console.log('🚀 Iniciando pruebas de integración del módulo de Proveedores...');

  const transaction = await sequelize.transaction();
  try {
    const uniqueSuffix = Date.now();
    const providerData = {
      nombre: 'Proveedor Test ' + uniqueSuffix,
      rnc: 'RNC-' + uniqueSuffix,
      telefono: '2222-3333',
      email: `contacto_${uniqueSuffix}@prov.com`,
      direccion: 'Zona Industrial Test',
      estado: 'activo'
    };

    // 1. Crear Proveedor
    console.log('1. Creando Proveedor Verificado...');
    const prov = await proveedorService.crearProveedor(providerData);
    console.log(`   -> Proveedor creado con ID: ${prov.id}, nombre: ${prov.nombre}`);
    if (prov.empresa_id !== 1) {
      throw new Error('FALLA: El proveedor no fue anclado al tenant global (empresa_id = 1).');
    }

    // 2. Listar Proveedores Activos (debe incluir el creado)
    console.log('2. Listando proveedores activos...');
    const activos = await proveedorService.obtenerProveedores();
    const existeEnListado = activos.some(p => p.id === prov.id);
    if (!existeEnListado) {
      throw new Error('FALLA: El proveedor creado no aparece en la lista de activos.');
    }
    console.log('   -> Correcto: El proveedor se encuentra en la lista global de activos.');

    // 3. Actualizar Proveedor
    console.log('3. Actualizando datos del proveedor...');
    const nuevoEmail = `ventas_${uniqueSuffix}@prov.com`;
    const provActualizado = await proveedorService.actualizarProveedor(prov.id, {
      email: nuevoEmail,
      direccion: 'Nueva dirección test'
    });
    console.log(`   -> Proveedor actualizado. Nuevo email: ${provActualizado.email}`);
    if (provActualizado.email !== nuevoEmail) {
      throw new Error('FALLA: No se actualizó el email del proveedor.');
    }

    // 4. Desactivar Proveedor (Eliminación lógica)
    console.log('4. Desactivando proveedor (eliminación lógica)...');
    await proveedorService.desactivarProveedor(prov.id);

    // 5. Verificar que ya no aparece en activos
    console.log('5. Verificando que ya NO figure en la lista de activos...');
    const activosDespues = await proveedorService.obtenerProveedores();
    const sigueActivo = activosDespues.some(p => p.id === prov.id);
    if (sigueActivo) {
      throw new Error('FALLA: El proveedor inactivo sigue apareciendo en el catálogo.');
    }
    console.log('   -> Correcto: El proveedor fue eliminado lógicamente del catálogo global.');

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE PROVEEDORES PASARON EXITOSAMENTE! 🎉');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
  } finally {
    await sequelize.close();
  }
};

runTest();
