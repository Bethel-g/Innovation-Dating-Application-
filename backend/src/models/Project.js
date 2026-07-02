import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { PROJECT_STATUS, PROJECT_ROLES, INNOVATION_FOCUS } from '../config/constants.js';

const Project = sequelize.define('Project', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  author: { type: DataTypes.UUID, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: false },
  tagline: { type: DataTypes.STRING(200), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  problemStatement: { type: DataTypes.TEXT, allowNull: true },
  proposedSolution: { type: DataTypes.TEXT, allowNull: true },
  innovationFocus: { type: DataTypes.ENUM(...INNOVATION_FOCUS), allowNull: true },
  status: {
    type: DataTypes.ENUM(...Object.values(PROJECT_STATUS)),
    defaultValue: PROJECT_STATUS.OPEN,
  },
  rolesNeeded: { type: DataTypes.JSON, defaultValue: [] },
  skillsNeeded: { type: DataTypes.JSON, defaultValue: [] },
  coverImage: { type: DataTypes.STRING, allowNull: true },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  isLookingForCoFounder: { type: DataTypes.BOOLEAN, defaultValue: false },
  isLookingForInvestor: { type: DataTypes.BOOLEAN, defaultValue: false },
  stage: {
    type: DataTypes.ENUM('idea', 'prototype', 'mvp', 'beta', 'launched', 'scaling'),
    defaultValue: 'idea',
  },
  websiteUrl: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
});

export default Project;
