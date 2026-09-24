import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const JobSave = sequelize.define('JobSave', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  job: { type: DataTypes.UUID, allowNull: false },
  user: { type: DataTypes.UUID, allowNull: false },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user', 'job'] },
  ],
});

export default JobSave;