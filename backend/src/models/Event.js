import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const EVENT_TYPES = ['networking', 'hackathon', 'pitch', 'webinar', 'mentorship', 'meetup'];

const Event = sequelize.define('Event', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  organizer: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM(...EVENT_TYPES), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  date: { type: DataTypes.STRING, allowNull: true },
  time: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
  isFree: { type: DataTypes.BOOLEAN, defaultValue: true },
  price: { type: DataTypes.STRING, allowNull: true },
  maxAttendees: { type: DataTypes.INTEGER, allowNull: true },
  attendees: { type: DataTypes.INTEGER, defaultValue: 0 },
  speakers: { type: DataTypes.JSON, defaultValue: [] },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

export default Event;