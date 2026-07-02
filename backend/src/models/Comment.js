import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  post: { type: DataTypes.UUID, allowNull: false },
  author: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  parentComment: { type: DataTypes.UUID, allowNull: true },
  likeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isEdited: { type: DataTypes.BOOLEAN, defaultValue: false },
  isFlagged: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

export default Comment;
