import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { REACTION_TYPES } from '../config/constants.js';

const Like = sequelize.define('Like', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user: { type: DataTypes.UUID, allowNull: false },
  targetType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetId: { type: DataTypes.UUID, allowNull: false },
  reactionType: {
    type: DataTypes.ENUM(...Object.values(REACTION_TYPES)),
    defaultValue: REACTION_TYPES.LIKE,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user', 'targetType', 'targetId'] },
  ],
});

export default Like;
