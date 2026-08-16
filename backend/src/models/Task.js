import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { TASK_STATUS, TASK_PRIORITY } from '../config/constants.js';

const Task = sequelize.define('Task', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  project: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM(...Object.values(TASK_STATUS)),
    defaultValue: TASK_STATUS.TODO,
  },
  priority: {
    type: DataTypes.ENUM(...Object.values(TASK_PRIORITY)),
    defaultValue: TASK_PRIORITY.MEDIUM,
  },
  assignee: { type: DataTypes.UUID, allowNull: true },
  createdBy: { type: DataTypes.UUID, allowNull: false },
  dueDate: { type: DataTypes.DATE, allowNull: true },
  estimatedHours: { type: DataTypes.FLOAT, allowNull: true },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  attachments: { type: DataTypes.JSON, defaultValue: [] },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
});

export default Task;
