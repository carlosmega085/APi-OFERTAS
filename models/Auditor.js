import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Auditor = sequelize.define('Auditor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Relación con el usuario del auditor'
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Relación con el tenant global o personal'
  },
  cedula: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cv_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  titulo_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacitacion_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  carta1_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  carta2_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  carta3_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  foto_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado_perfil: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
    defaultValue: 'pendiente'
  }
}, {
  tableName: 'auditores',
  underscored: true
});

export default Auditor;
