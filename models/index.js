import sequelize from '../config/database.js';
import Empresa from './Empresa.js';
import Plan from './Plan.js';
import Suscripcion from './Suscripcion.js';
import Usuario from './Usuario.js';
import Tienda from './Tienda.js';
import PeticionProcesada from './PeticionProcesada.js';
import SaaSConfig from './SaaSConfig.js';
import EmpresaPerfil from './EmpresaPerfil.js';
import Consultor from './Consultor.js';
import Auditor from './Auditor.js';
import Proveedor from './Proveedor.js';
import Diagnostico from './Diagnostico.js';
import Recomendacion from './Recomendacion.js';

// --- CORE RELATIONS ---

// Empresa <-> Tienda (Sucursal / Establecimiento)
Empresa.hasMany(Tienda, { foreignKey: 'empresa_id' });
Tienda.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Empresa <-> Suscripcion <-> Plan
Empresa.hasMany(Suscripcion, { foreignKey: 'empresa_id' });
Suscripcion.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Plan.hasMany(Suscripcion, { foreignKey: 'plan_id' });
Suscripcion.belongsTo(Plan, { foreignKey: 'plan_id' });

// Empresa <-> Usuario
Empresa.hasMany(Usuario, { foreignKey: 'empresa_id' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Usuario <-> Tienda (Sucursal / Establecimiento)
Tienda.hasMany(Usuario, { foreignKey: 'tienda_id' });
Usuario.belongsTo(Tienda, { foreignKey: 'tienda_id' });

// --- NEW PLATFORM PROFILES RELATIONS ---
Usuario.hasOne(EmpresaPerfil, { foreignKey: 'usuario_id', as: 'empresaPerfil' });
EmpresaPerfil.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Empresa.hasOne(EmpresaPerfil, { foreignKey: 'empresa_id', as: 'perfil' });
EmpresaPerfil.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Usuario.hasOne(Consultor, { foreignKey: 'usuario_id', as: 'consultorPerfil' });
Consultor.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Empresa.hasMany(Consultor, { foreignKey: 'empresa_id' });
Consultor.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Usuario.hasOne(Auditor, { foreignKey: 'usuario_id', as: 'auditorPerfil' });
Auditor.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Empresa.hasMany(Auditor, { foreignKey: 'empresa_id' });
Auditor.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Empresa <-> Proveedor (Proveedores Verificados)
Empresa.hasMany(Proveedor, { foreignKey: 'empresa_id', as: 'proveedores' });
Proveedor.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// --- DIAGNOSTICS & RECOMMENDATIONS RELATIONS ---

// Diagnostico <-> Empresa, Consultor, Auditor
Empresa.hasMany(Diagnostico, { foreignKey: 'empresa_id', as: 'diagnosticos' });
Diagnostico.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Consultor.hasMany(Diagnostico, { foreignKey: 'consultor_id', as: 'diagnosticos' });
Diagnostico.belongsTo(Consultor, { foreignKey: 'consultor_id' });

Auditor.hasMany(Diagnostico, { foreignKey: 'auditor_id', as: 'auditoriasShadow' });
Diagnostico.belongsTo(Auditor, { foreignKey: 'auditor_id' });

// Diagnostico <-> Recomendacion
Diagnostico.hasMany(Recomendacion, { foreignKey: 'diagnostico_id', as: 'recomendaciones' });
Recomendacion.belongsTo(Diagnostico, { foreignKey: 'diagnostico_id' });

// Recomendacion <-> Proveedor
Proveedor.hasMany(Recomendacion, { foreignKey: 'proveedor_id', as: 'sugerencias' });
Recomendacion.belongsTo(Proveedor, { foreignKey: 'proveedor_id' });

// --- MISC / IDEMPOTENCY ---

// PeticionProcesada (Seguridad contra reintentos por errores de red)
Empresa.hasMany(PeticionProcesada, { foreignKey: 'empresa_id' });
PeticionProcesada.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Usuario.hasMany(PeticionProcesada, { foreignKey: 'usuario_id' });
PeticionProcesada.belongsTo(Usuario, { foreignKey: 'usuario_id' });

export {
  sequelize,
  Empresa,
  Plan,
  Suscripcion,
  Usuario,
  Tienda,
  PeticionProcesada,
  SaaSConfig,
  EmpresaPerfil,
  Consultor,
  Auditor,
  Proveedor,
  Diagnostico,
  Recomendacion
};
