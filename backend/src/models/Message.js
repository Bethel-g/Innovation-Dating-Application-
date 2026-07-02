import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Message = sequelize.define('Message', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  match: { type: DataTypes.UUID, allowNull: false },
  sender: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'voice', 'system'),
    defaultValue: 'text',
  },
  mediaUrl: { type: DataTypes.STRING, allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE, allowNull: true },
  isFlagged: { type: DataTypes.BOOLEAN, defaultValue: false },
  flagReason: { type: DataTypes.STRING, allowNull: true },
  icebreakerPrompt: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

export default Message;
