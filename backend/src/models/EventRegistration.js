import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const EventRegistration = sequelize.define('EventRegistration', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  event: { type: DataTypes.UUID, allowNull: false },
  user: { type: DataTypes.UUID, allowNull: false },
}, {
  timestamps: true,
});

export default EventRegistration;