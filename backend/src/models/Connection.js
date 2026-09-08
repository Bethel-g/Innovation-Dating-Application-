import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { CONNECTION_STATE } from '../config/constants.js';

const Connection = sequelize.define('Connection', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  requester: { type: DataTypes.UUID, allowNull: false },
  recipient: { type: DataTypes.UUID, allowNull: false },
  ideaId: { type: DataTypes.UUID, allowNull: true },
  note: { type: DataTypes.STRING(600), allowNull: true },
  status: {
    type: DataTypes.ENUM(...Object.values(CONNECTION_STATE)),
    defaultValue: CONNECTION_STATE.PENDING,
  },
  respondedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['requester', 'recipient'] },
    { fields: ['recipient', 'status'] },
  ],
});

export default Connection;