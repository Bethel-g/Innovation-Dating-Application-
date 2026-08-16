import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const GroupMessage = sequelize.define('GroupMessage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  groupType: {
    type: DataTypes.ENUM('project', 'community'),
    allowNull: false,
  },
  groupId: { type: DataTypes.UUID, allowNull: false },
  sender: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'file', 'system'),
    defaultValue: 'text',
  },
  mediaUrl: { type: DataTypes.STRING, allowNull: true },
  isEdited: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

export default GroupMessage;
