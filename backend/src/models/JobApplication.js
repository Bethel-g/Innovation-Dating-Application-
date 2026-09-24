import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const APPLICATION_STATUSES = ['applied', 'review', 'interview', 'offer', 'rejected'];

const JobApplication = sequelize.define('JobApplication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  job: { type: DataTypes.UUID, allowNull: false },
  applicant: { type: DataTypes.UUID, allowNull: false },
  coverLetter: { type: DataTypes.TEXT, allowNull: true },
  experience: { type: DataTypes.TEXT, allowNull: true },
  availability: { type: DataTypes.STRING, allowNull: true },
  expectedSalary: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM(...APPLICATION_STATUSES), defaultValue: 'applied' },
}, {
  timestamps: true,
});

export default JobApplication;