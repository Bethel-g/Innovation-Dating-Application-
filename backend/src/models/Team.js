import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Team = sequelize.define('Team', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  idea: { type: DataTypes.UUID, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('active', 'archived'),
    defaultValue: 'active',
  },
}, {
  timestamps: true,
});

export default Team;