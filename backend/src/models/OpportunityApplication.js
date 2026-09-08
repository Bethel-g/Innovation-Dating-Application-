import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { OPPORTUNITY_APPLICANT_TYPE, APPLICATION_STATUS } from '../config/constants.js';

const OpportunityApplication = sequelize.define('OpportunityApplication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  opportunity: { type: DataTypes.UUID, allowNull: false },
  applicantType: {
    type: DataTypes.ENUM(...Object.values(OPPORTUNITY_APPLICANT_TYPE)),
    defaultValue: OPPORTUNITY_APPLICANT_TYPE.USER,
  },
  applicantUser: { type: DataTypes.UUID, allowNull: false },
  applicantIdea: { type: DataTypes.UUID, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM(...Object.values(APPLICATION_STATUS)),
    defaultValue: APPLICATION_STATUS.PENDING,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['opportunity', 'applicantUser'] },
  ],
});

export default OpportunityApplication;