import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Match = sequelize.define('Match', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  users: { type: DataTypes.JSON, allowNull: false },
  initiator: { type: DataTypes.UUID, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'liked', 'super_liked', 'matched', 'blocked'),
    defaultValue: 'pending',
  },
  compatibilityScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  matchedAt: { type: DataTypes.DATE, allowNull: true },
  blockedBy: { type: DataTypes.UUID, allowNull: true },
}, { timestamps: true });

export default Match;
