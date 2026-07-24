import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Recomendacion = sequelize.define('Recomendacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  diagnostico_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Relación con el diagnóstico del cual nace esta sugerencia'
  },
  tipo_sugerencia: {
    type: DataTypes.ENUM('insumo', 'servicio', 'equipo'),
    allowNull: false,
    comment: 'Categorización de la sugerencia'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Detalle de la recomendación de mejora'
  },
  norma_asociada: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Norma o regulación técnica relacionada (ej: HACCP Sección 5)'
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Relación opcional con un proveedor verificado del ecosistema'
  },
  estado_seguimiento: {
    type: DataTypes.ENUM('pendiente', 'en_progreso', 'implementado'),
    allowNull: false,
    defaultValue: 'pendiente',
    comment: 'Estado de avance de la recomendación'
  },
  evidencia_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Enlace a la foto o documento de evidencia de implementación'
  },
  fecha_implementacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora en la que se marcó como implementada'
  }
}, {
  tableName: 'recomendaciones',
  underscored: true
});

export default Recomendacion;
