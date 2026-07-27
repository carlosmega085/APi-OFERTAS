import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Conversacion = sequelize.define('Conversacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del primer usuario de la conversación (siempre el menor ID)'
  },
  usuario2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del segundo usuario de la conversación (siempre el mayor ID)'
  },
  ultimo_mensaje: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Previsualización del último mensaje enviado'
  },
  fecha_ultimo_mensaje: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha del último mensaje enviado para ordenamiento'
  }
}, {
  tableName: 'conversaciones',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['usuario1_id', 'usuario2_id'],
      name: 'unique_conversacion_usuarios'
    }
  ]
});

export default Conversacion;
