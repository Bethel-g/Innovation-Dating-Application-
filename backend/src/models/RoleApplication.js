import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { APPLICATION_STATUS } from '../config/constants.js';

const RoleApplication = sequelize.define('RoleApplication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  role: { type: DataTypes.UUID, allowNull: false },
  applicant: { type: DataTypes.UUID, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: true },
  highlights: { type: DataTypes.JSON, defaultValue: [] },
  status: {
    type: DataTypes.ENUM(...Object.values(APPLICATION_STATUS)),
    defaultValue: APPLICATION_STATUS.PENDING,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['role', 'applicant'] },
    { fields: ['status'] },
  ],
});

export default RoleApplication;