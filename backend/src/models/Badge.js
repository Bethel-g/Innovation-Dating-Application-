import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { BADGE_TYPES } from '../config/constants.js';

const Badge = sequelize.define('Badge', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM(...Object.values(BADGE_TYPES)),
    allowNull: false,
  },
  awardedBy: { type: DataTypes.UUID, allowNull: true },
  reason: { type: DataTypes.TEXT, allowNull: true },
  projectId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
});

export default Badge;
