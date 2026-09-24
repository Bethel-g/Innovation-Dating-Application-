import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const JOB_EXPERIENCE = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
const JOB_STATUS = ['open', 'closed'];

const Job = sequelize.define('Job', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  author: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  type: { type: DataTypes.ENUM(...JOB_TYPES), allowNull: true },
  experience: { type: DataTypes.ENUM(...JOB_EXPERIENCE), allowNull: true },
  category: { type: DataTypes.STRING, allowNull: true },
  salary: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  requirements: { type: DataTypes.JSON, defaultValue: [] },
  benefits: { type: DataTypes.JSON, defaultValue: [] },
  skills: { type: DataTypes.JSON, defaultValue: [] },
  remote: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM(...JOB_STATUS), defaultValue: 'open' },
  applicantCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
});

export default Job;