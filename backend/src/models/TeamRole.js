import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { TEAM_ROLE_TYPE, TEAM_ROLE_STATUS } from '../config/constants.js';

const TeamRole = sequelize.define('TeamRole', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  idea: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  roleType: {
    type: DataTypes.ENUM(...Object.values(TEAM_ROLE_TYPE)),
    defaultValue: TEAM_ROLE_TYPE.OTHER,
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  skillsNeeded: { type: DataTypes.JSON, defaultValue: [] },
  status: {
    type: DataTypes.ENUM(...Object.values(TEAM_ROLE_STATUS)),
    defaultValue: TEAM_ROLE_STATUS.OPEN,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['idea'] },
    { fields: ['status'] },
  ],
});

export default TeamRole;