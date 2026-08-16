import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ActivityLog = sequelize.define('ActivityLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  groupType: {
    type: DataTypes.ENUM('project', 'community'),
    allowNull: false,
  },
  groupId: { type: DataTypes.UUID, allowNull: false },
  user: { type: DataTypes.UUID, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.JSON, allowNull: true },
}, {
  timestamps: true,
});

export default ActivityLog;
