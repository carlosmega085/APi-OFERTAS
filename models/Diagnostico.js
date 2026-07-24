import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Diagnostico = sequelize.define('Diagnostico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Relación con el tenant de la empresa evaluada'
  },
  consultor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Relación con el consultor que realiza la evaluación'
  },
  auditor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Relación opcional con un auditor en formación participante'
  },
  puntaje_cumplimiento: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Porcentaje de cumplimiento normativo (0.00 a 100.00)'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas y observaciones generales del diagnóstico'
  },
  estado: {
    type: DataTypes.ENUM('borrador', 'finalizado', 'firmado'),
    defaultValue: 'borrador',
    allowNull: false
  },
  firma_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nombre de la persona o representante que firma la aceptación del diagnóstico'
  },
  fecha_firma: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora en la que se firmó el diagnóstico'
  }
}, {
  tableName: 'diagnosticos',
  underscored: true
});

export default Diagnostico;
