import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Follow = sequelize.define('Follow', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  follower: { type: DataTypes.UUID, allowNull: false },
  following: { type: DataTypes.UUID, allowNull: false },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['follower', 'following'] },
  ],
});

export default Follow;
