import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Like = sequelize.define('Like', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user: { type: DataTypes.UUID, allowNull: false },
  targetType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetId: { type: DataTypes.UUID, allowNull: false },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user', 'targetType', 'targetId'] },
  ],
});

export default Like;
