import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Endorsement = sequelize.define('Endorsement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  endorser: { type: DataTypes.UUID, allowNull: false },
  endorsed: { type: DataTypes.UUID, allowNull: false },
  skill: { type: DataTypes.STRING, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
});

export default Endorsement;
