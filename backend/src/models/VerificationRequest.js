import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { VERIFICATION_REQUEST_TYPE, VERIFICATION_REQUEST_STATUS } from '../config/constants.js';

const VerificationRequest = sequelize.define('VerificationRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: true },
  organizationId: { type: DataTypes.UUID, allowNull: true },
  requestType: {
    type: DataTypes.ENUM(...Object.values(VERIFICATION_REQUEST_TYPE)),
    allowNull: false,
  },
  documents: { type: DataTypes.JSON, defaultValue: [] },
  verificationNote: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM(...Object.values(VERIFICATION_REQUEST_STATUS)),
    defaultValue: VERIFICATION_REQUEST_STATUS.PENDING,
  },
  adminNotes: { type: DataTypes.TEXT, allowNull: true },
  reviewedBy: { type: DataTypes.UUID, allowNull: true },
  reviewedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['userId'] },
    { fields: ['organizationId'] },
  ],
});

export default VerificationRequest;