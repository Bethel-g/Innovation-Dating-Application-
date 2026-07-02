import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM(
      'new_match', 'new_message', 'profile_like', 'super_like',
      'suggestion', 'compatibility_alert', 'activity_reminder',
      'subscription', 'system', 'admin'
    ),
    allowNull: false,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  data: { type: DataTypes.JSON, allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE, allowNull: true },
  campaignId: { type: DataTypes.UUID, allowNull: true },
}, { timestamps: true });

export default Notification;
