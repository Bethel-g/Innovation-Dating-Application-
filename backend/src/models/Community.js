import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { COMMUNITY_VISIBILITY, INNOVATION_FOCUS } from '../config/constants.js';

const Community = sequelize.define('Community', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  author: { type: DataTypes.UUID, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  coverImage: { type: DataTypes.STRING, allowNull: true },
  visibility: {
    type: DataTypes.ENUM(...Object.values(COMMUNITY_VISIBILITY)),
    defaultValue: COMMUNITY_VISIBILITY.PUBLIC,
  },
  innovationFocus: { type: DataTypes.ENUM(...INNOVATION_FOCUS), allowNull: true },
  rules: { type: DataTypes.JSON, defaultValue: [] },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  memberCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

export default Community;
