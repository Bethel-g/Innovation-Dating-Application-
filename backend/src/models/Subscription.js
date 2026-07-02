import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user: { type: DataTypes.UUID, allowNull: false },
  tier: {
    type: DataTypes.ENUM('free', 'premium', 'vip'),
    defaultValue: 'free',
  },
  startDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  endDate: { type: DataTypes.DATE, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  autoRenew: { type: DataTypes.BOOLEAN, defaultValue: false },
  paymentMethod: { type: DataTypes.STRING, allowNull: true },
  transactionId: { type: DataTypes.STRING, allowNull: true },
  amount: { type: DataTypes.FLOAT, allowNull: true },
  features: {
    type: DataTypes.JSON,
    defaultValue: {
      unlimitedSwipes: false,
      advancedFilters: false,
      profileBoost: false,
      incognitoMode: false,
      readReceipts: false,
    },
  },
}, { timestamps: true });

export default Subscription;
