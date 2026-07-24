import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmpresaPerfil = sequelize.define('EmpresaPerfil', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Relación con el tenant de la empresa'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Relación con el usuario administrador/representante'
  },
  razon_social: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rup: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  representante_nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  representante_telefono: {
    type: DataTypes.STRING,
    allowNull: false
  },
  representante_correo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  programa_requisitos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo_servicio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado_perfil: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
    defaultValue: 'pendiente'
  }
}, {
  tableName: 'empresa_perfiles',
  underscored: true
});

export default EmpresaPerfil;
