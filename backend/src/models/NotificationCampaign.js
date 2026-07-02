import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const NotificationCampaign = sequelize.define('NotificationCampaign', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  type: {
    type: DataTypes.ENUM('promotional', 'behavioral', 'system', 'custom'),
    defaultValue: 'custom',
  },
  targetAudience: { type: DataTypes.JSON, allowNull: true },
  schedule: { type: DataTypes.JSON, allowNull: true },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled'),
    defaultValue: 'draft',
  },
  sentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  openedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, { timestamps: true });

export default NotificationCampaign;
