import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reviewer: { type: DataTypes.UUID, allowNull: false },
  reviewed: { type: DataTypes.UUID, allowNull: false },
  project: { type: DataTypes.UUID, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: true },
  skills: { type: DataTypes.JSON, defaultValue: [] },
}, {
  timestamps: true,
});

export default Review;
