import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { CONTRIBUTION_TYPES } from '../config/constants.js';

const Contribution = sequelize.define('Contribution', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM(...Object.values(CONTRIBUTION_TYPES)),
    allowNull: false,
  },
  points: { type: DataTypes.INTEGER, allowNull: false },
  referenceId: { type: DataTypes.UUID, allowNull: true },
  referenceType: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
});

export default Contribution;
