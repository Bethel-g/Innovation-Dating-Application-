import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Report = sequelize.define('Report', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reporter: { type: DataTypes.UUID, allowNull: false },
  reported: { type: DataTypes.UUID, allowNull: false },
  reason: {
    type: DataTypes.ENUM('fake_profile', 'harassment', 'inappropriate_content', 'spam', 'underage', 'other'),
    allowNull: false,
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
    defaultValue: 'pending',
  },
  evidence: { type: DataTypes.JSON, defaultValue: [] },
  reviewedBy: { type: DataTypes.UUID, allowNull: true },
  resolution: { type: DataTypes.TEXT, allowNull: true },
  actionTaken: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

export default Report;
