import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Mensaje = sequelize.define('Mensaje', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Relación con la conversación de origen'
  },
  emisor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del usuario emisor'
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Contenido del mensaje'
  },
  leido: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si el mensaje fue leído por el receptor'
  },
  fecha_lectura: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora en la que se leyó el mensaje'
  }
}, {
  tableName: 'mensajes',
  underscored: true
});

export default Mensaje;
