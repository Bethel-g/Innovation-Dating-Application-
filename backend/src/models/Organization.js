import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { ORG_TYPES, ORG_VERIFICATION_STATUS } from '../config/constants.js';

const Organization = sequelize.define('Organization', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  owner: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  type: {
    type: DataTypes.ENUM(...Object.values(ORG_TYPES)),
    defaultValue: ORG_TYPES.HUB,
  },
  mission: { type: DataTypes.TEXT, allowNull: true },
  focusAreas: { type: DataTypes.JSON, defaultValue: [] },
  sectors: { type: DataTypes.JSON, defaultValue: [] },
  website: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  photos: { type: DataTypes.JSON, defaultValue: [] },
  locationCity: { type: DataTypes.STRING, allowNull: true },
  locationCountry: { type: DataTypes.STRING, allowNull: true },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationStatus: {
    type: DataTypes.ENUM(...Object.values(ORG_VERIFICATION_STATUS)),
    defaultValue: ORG_VERIFICATION_STATUS.UNVERIFIED,
  },
}, {
  timestamps: true,
});

export default Organization;