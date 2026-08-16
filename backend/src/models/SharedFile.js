import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const SharedFile = sequelize.define('SharedFile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  groupType: {
    type: DataTypes.ENUM('project', 'community'),
    allowNull: false,
  },
  groupId: { type: DataTypes.UUID, allowNull: false },
  uploadedBy: { type: DataTypes.UUID, allowNull: false },
  fileName: { type: DataTypes.STRING, allowNull: false },
  fileUrl: { type: DataTypes.STRING, allowNull: false },
  fileSize: { type: DataTypes.INTEGER, allowNull: true },
  mimeType: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
});

export default SharedFile;
