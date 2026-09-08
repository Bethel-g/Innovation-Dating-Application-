import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import {
  OPPORTUNITY_TYPE, OPPORTUNITY_STATUS, IDEA_STAGE,
} from '../config/constants.js';

const Opportunity = sequelize.define('Opportunity', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  organization: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  type: {
    type: DataTypes.ENUM(...Object.values(OPPORTUNITY_TYPE)),
    defaultValue: OPPORTUNITY_TYPE.CALL_FOR_INNOVATION,
  },
  eligibilityCriteria: { type: DataTypes.JSON, defaultValue: [] },
  sectors: { type: DataTypes.JSON, defaultValue: [] },
  skillsNeeded: { type: DataTypes.JSON, defaultValue: [] },
  stage: {
    type: DataTypes.ENUM(...Object.values(IDEA_STAGE)),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(OPPORTUNITY_STATUS)),
    defaultValue: OPPORTUNITY_STATUS.OPEN,
  },
  deadline: { type: DataTypes.DATE, allowNull: true },
  capacity: { type: DataTypes.INTEGER, allowNull: true },
  fundingAmount: { type: DataTypes.STRING, allowNull: true },
  externalLink: { type: DataTypes.STRING, allowNull: true },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  applicationCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['organization'] },
    { fields: ['deadline'] },
  ],
});

export default Opportunity;