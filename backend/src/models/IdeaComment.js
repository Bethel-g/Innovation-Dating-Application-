import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const IdeaComment = sequelize.define('IdeaComment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  idea: { type: DataTypes.UUID, allowNull: false },
  author: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, {
  timestamps: true,
});

export default IdeaComment;