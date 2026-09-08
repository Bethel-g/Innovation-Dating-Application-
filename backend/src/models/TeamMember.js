import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const TeamMember = sequelize.define('TeamMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  team: { type: DataTypes.UUID, allowNull: false },
  user: { type: DataTypes.UUID, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: true },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['team', 'user'] },
  ],
});

export default TeamMember;