import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const CommunityMember = sequelize.define('CommunityMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  community: { type: DataTypes.UUID, allowNull: false },
  user: { type: DataTypes.UUID, allowNull: false },
  role: {
    type: DataTypes.ENUM('member', 'moderator', 'admin'),
    defaultValue: 'member',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'left'),
    defaultValue: 'approved',
  },
  joinedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['community', 'user'] },
  ],
});

export default CommunityMember;
