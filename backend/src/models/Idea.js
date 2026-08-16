import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { IDEA_STATUS, IDEA_CATEGORIES } from '../config/constants.js';

const Idea = sequelize.define('Idea', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  author: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  problemStatement: { type: DataTypes.TEXT, allowNull: true },
  proposedSolution: { type: DataTypes.TEXT, allowNull: true },
  category: {
    type: DataTypes.ENUM(...IDEA_CATEGORIES),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(IDEA_STATUS)),
    defaultValue: IDEA_STATUS.OPEN,
  },
  rolesNeeded: { type: DataTypes.JSON, defaultValue: [] },
  skillsNeeded: { type: DataTypes.JSON, defaultValue: [] },
  attachments: { type: DataTypes.JSON, defaultValue: [] },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  isLookingForCoFounder: { type: DataTypes.BOOLEAN, defaultValue: false },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'invite_only'),
    defaultValue: 'public',
  },
  collaborationRequests: { type: DataTypes.JSON, defaultValue: [] },
  likeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  commentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
});

export default Idea;
