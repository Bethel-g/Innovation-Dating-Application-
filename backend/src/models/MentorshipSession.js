import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const SESSION_TYPES = ['quick', 'standard', 'deep', 'review'];
const SESSION_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

const MentorshipSession = sequelize.define('MentorshipSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  mentor: { type: DataTypes.UUID, allowNull: false },
  mentee: { type: DataTypes.UUID, allowNull: false },
  sessionType: { type: DataTypes.ENUM(...SESSION_TYPES), defaultValue: 'standard' },
  date: { type: DataTypes.STRING, allowNull: true },
  scheduledFor: { type: DataTypes.DATE, allowNull: true },
  topic: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM(...SESSION_STATUSES), defaultValue: 'pending' },
}, {
  timestamps: true,
});

export default MentorshipSession;