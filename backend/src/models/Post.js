import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Post = sequelize.define('Post', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  author: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  mediaUrls: { type: DataTypes.JSON, defaultValue: [] },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  hashtags: { type: DataTypes.JSON, defaultValue: [] },
  mentionIds: { type: DataTypes.JSON, defaultValue: [] },
  type: {
    type: DataTypes.ENUM('post', 'idea', 'achievement', 'project_update', 'article', 'question'),
    defaultValue: 'post',
  },
  isDraft: { type: DataTypes.BOOLEAN, defaultValue: false },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  likeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  commentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  shareCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
});

export default Post;
