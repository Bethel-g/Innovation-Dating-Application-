import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';
import {
  HEALTH_SPECIALTIES, WORK_SETTINGS, INNOVATION_FOCUS, PERSONALITY_TRAITS,
} from '../config/constants.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: true, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
  gender: { type: DataTypes.ENUM('male', 'female', 'non-binary', 'other'), allowNull: true },
  interestedIn: { type: DataTypes.JSON, defaultValue: [] },
  bio: { type: DataTypes.STRING(500), allowNull: true },
  photos: { type: DataTypes.JSON, defaultValue: [] },
  locationLat: { type: DataTypes.FLOAT, defaultValue: 0 },
  locationLng: { type: DataTypes.FLOAT, defaultValue: 0 },
  locationCity: { type: DataTypes.STRING, allowNull: true },
  locationCountry: { type: DataTypes.STRING, allowNull: true },
  interests: { type: DataTypes.JSON, defaultValue: [] },
  ageRangeMin: { type: DataTypes.INTEGER, defaultValue: 18 },
  ageRangeMax: { type: DataTypes.INTEGER, defaultValue: 60 },
  maxDistance: { type: DataTypes.INTEGER, defaultValue: 50 },
  genderPreference: { type: DataTypes.JSON, defaultValue: [] },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
  lastActive: { type: DataTypes.DATE, allowNull: true },
  subscriptionTier: { type: DataTypes.ENUM('free', 'premium', 'vip'), defaultValue: 'free' },
  dailySwipes: { type: DataTypes.INTEGER, defaultValue: 0 },
  maxDailySwipes: { type: DataTypes.INTEGER, defaultValue: 50 },
  onboardingComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  role: { type: DataTypes.ENUM('user', 'admin', 'moderator', 'support'), defaultValue: 'user' },
  notificationPreferences: { type: DataTypes.JSON, allowNull: true },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      userManagement: false,
      contentModeration: false,
      analytics: false,
      adminManagement: false,
      notificationManagement: false,
      subscriptionManagement: false,
    },
  },
  socialLinks: { type: DataTypes.JSON, allowNull: true },

  healthSpecialty: { type: DataTypes.ENUM(...HEALTH_SPECIALTIES), allowNull: true },
  workSetting: { type: DataTypes.ENUM(...WORK_SETTINGS), allowNull: true },
  innovationFocus: { type: DataTypes.ENUM(...INNOVATION_FOCUS), allowNull: true },
  personalityTraits: { type: DataTypes.JSON, defaultValue: [] },
  certifications: { type: DataTypes.JSON, defaultValue: [] },
  education: { type: DataTypes.JSON, allowNull: true },
  yearsOfExperience: { type: DataTypes.INTEGER, defaultValue: 0 },
  innovationScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  collaborationIntent: {
    type: DataTypes.ENUM('dating', 'co_founder', 'networking', 'mentorship', 'open'),
    defaultValue: 'open',
  },
  lookingForTeam: { type: DataTypes.BOOLEAN, defaultValue: false },
  availableForProjects: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeCreate: async (user) => {
      const { calculateInnovationScore } = await import('../services/aiService.js');
      user.innovationScore = calculateInnovationScore(user);
    },
    beforeUpdate: async (user) => {
      const fields = ['healthSpecialty', 'certifications', 'yearsOfExperience',
        'availableForProjects', 'lookingForTeam', 'personalityTraits', 'innovationFocus'];
      if (fields.some(f => user.changed(f))) {
        const { calculateInnovationScore } = await import('../services/aiService.js');
        user.innovationScore = calculateInnovationScore(user);
      }
    },
  },
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;
