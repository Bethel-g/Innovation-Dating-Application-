import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { BOOKMARK_TARGET_TYPE } from '../config/constants.js';

const Bookmark = sequelize.define('Bookmark', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user: { type: DataTypes.UUID, allowNull: false },
  targetType: {
    type: DataTypes.ENUM(...Object.values(BOOKMARK_TARGET_TYPE)),
    allowNull: false,
  },
  targetId: { type: DataTypes.UUID, allowNull: false },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user', 'targetType', 'targetId'] },
  ],
});

export default Bookmark;