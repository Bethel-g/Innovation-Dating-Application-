import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { NOTIFICATION_CHANNEL } from '../config/constants.js';

const NotificationPreference = sequelize.define('NotificationPreference', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user: { type: DataTypes.UUID, allowNull: false },
  channel: {
    type: DataTypes.ENUM(...Object.values(NOTIFICATION_CHANNEL)),
    defaultValue: NOTIFICATION_CHANNEL.IN_APP,
  },
  eventType: { type: DataTypes.STRING, allowNull: false },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user', 'channel', 'eventType'] },
  ],
});

export default NotificationPreference;