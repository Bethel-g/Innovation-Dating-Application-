import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { PROJECT_ROLES } from '../config/constants.js';

const ProjectMember = sequelize.define('ProjectMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  project: { type: DataTypes.UUID, allowNull: false },
  user: { type: DataTypes.UUID, allowNull: false },
  role: { type: DataTypes.ENUM(...PROJECT_ROLES), defaultValue: 'contributor' },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'left'),
    defaultValue: 'pending',
  },
  joinedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['project', 'user'] },
  ],
});

export default ProjectMember;
