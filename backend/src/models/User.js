import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';
import {
  USER_ROLES, HEALTH_SPECIALTIES, WORK_SETTINGS, INNOVATION_FOCUS,
  PERSONALITY_TRAITS, PROFICIENCY_LEVELS, INTENTS, EXPERIENCE_LEVEL,
} from '../config/constants.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: true, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  headline: { type: DataTypes.STRING(200), allowNull: true },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
  gender: { type: DataTypes.ENUM('male', 'female', 'non-binary', 'other'), allowNull: true },
  bio: { type: DataTypes.STRING(1000), allowNull: true },
  photos: { type: DataTypes.JSON, defaultValue: [] },
  locationLat: { type: DataTypes.FLOAT, defaultValue: 0 },
  locationLng: { type: DataTypes.FLOAT, defaultValue: 0 },
  locationCity: { type: DataTypes.STRING, allowNull: true },
  locationCountry: { type: DataTypes.STRING, allowNull: true },
  interests: { type: DataTypes.JSON, defaultValue: [] },
  ageRangeMin: { type: DataTypes.INTEGER, defaultValue: 18 },
  ageRangeMax: { type: DataTypes.INTEGER, defaultValue: 60 },
  maxDistance: { type: DataTypes.INTEGER, defaultValue: 50 },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
  lastActive: { type: DataTypes.DATE, allowNull: true },
  subscriptionTier: { type: DataTypes.ENUM('free', 'premium', 'vip'), defaultValue: 'free' },
  dailySwipes: { type: DataTypes.INTEGER, defaultValue: 0 },
  maxDailySwipes: { type: DataTypes.INTEGER, defaultValue: 50 },
  onboardingComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  role: { type: DataTypes.ENUM('user', 'admin', 'moderator', 'support', 'mentor', 'company'), defaultValue: 'user' },
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
      socialMediaModeration: false,
      communityManagement: false,
      projectManagement: false,
    },
  },
  socialLinks: { type: DataTypes.JSON, allowNull: true },

  // Professional fields
  skills: { type: DataTypes.JSON, defaultValue: [] },
  primarySkills: { type: DataTypes.JSON, defaultValue: [] },
  secondarySkills: { type: DataTypes.JSON, defaultValue: [] },
  intents: { type: DataTypes.JSON, defaultValue: [] },
  experienceLevel: { type: DataTypes.ENUM('student', 'junior', 'mid', 'senior', 'lead', 'c-level', 'vp', 'freelance'), allowNull: true },
  yearsOfExperience: { type: DataTypes.INTEGER, defaultValue: 0 },
  portfolioUrls: { type: DataTypes.JSON, defaultValue: [] },
  githubUrl: { type: DataTypes.STRING, allowNull: true },
  behanceUrl: { type: DataTypes.STRING, allowNull: true },
  websiteUrl: { type: DataTypes.STRING, allowNull: true },
  linkedinUrl: { type: DataTypes.STRING, allowNull: true },

  // Legacy health fields (for backward compatibility)
  healthSpecialty: { type: DataTypes.ENUM(...HEALTH_SPECIALTIES), allowNull: true },
  workSetting: { type: DataTypes.ENUM(...WORK_SETTINGS), allowNull: true },
  innovationFocus: { type: DataTypes.ENUM(...INNOVATION_FOCUS), allowNull: true },
  personalityTraits: { type: DataTypes.JSON, defaultValue: [] },
  certifications: { type: DataTypes.JSON, defaultValue: [] },
  education: { type: DataTypes.JSON, allowNull: true },
  innovationScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  collaborationIntent: { type: DataTypes.ENUM('dating', 'co_founder', 'networking', 'mentorship', 'open', 'hire', 'get_hired', 'collaborate', 'learn', 'mentor'), defaultValue: 'open' },
  lookingForTeam: { type: DataTypes.BOOLEAN, defaultValue: false },
  availableForProjects: { type: DataTypes.BOOLEAN, defaultValue: false },

  // Reputation
  reputationScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  reputationLevel: { type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'), defaultValue: 'bronze' },
  endorsementCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  profileCompleteness: { type: DataTypes.INTEGER, defaultValue: 0 },

  // Mentor fields
  isMentor: { type: DataTypes.BOOLEAN, defaultValue: false },
  mentorExpertise: { type: DataTypes.JSON, defaultValue: [] },
  mentorAvailability: { type: DataTypes.JSON, allowNull: true },
  mentorshipCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
      if (user.changed('skills') || user.changed('primarySkills') || user.changed('secondarySkills') || user.changed('portfolioUrls') || user.changed('education')) {
        user.profileCompleteness = calculateProfileCompleteness(user);
      }
    },
    beforeCreate: async (user) => {
      const { calculateInnovationScore } = await import('../services/aiService.js');
      user.innovationScore = calculateInnovationScore(user);
      user.profileCompleteness = calculateProfileCompleteness(user);
    },
    beforeUpdate: async (user) => {
      const aiFields = ['healthSpecialty', 'certifications', 'yearsOfExperience',
        'availableForProjects', 'lookingForTeam', 'personalityTraits', 'innovationFocus'];
      if (aiFields.some(f => user.changed(f))) {
        const { calculateInnovationScore } = await import('../services/aiService.js');
        user.innovationScore = calculateInnovationScore(user);
      }
    },
  },
});

function calculateProfileCompleteness(user) {
  let score = 0;
  if (user.name) score += 10;
  if (user.headline) score += 10;
  if (user.bio && user.bio.length > 20) score += 10;
  if ((user.photos || []).length > 0) score += 10;
  if ((user.skills || []).length > 0) score += 15;
  if ((user.primarySkills || []).length > 0) score += 10;
  if ((user.intents || []).length > 0) score += 10;
  if (user.experienceLevel) score += 5;
  if (user.yearsOfExperience > 0) score += 5;
  if (user.education) score += 5;
  if (user.githubUrl || user.portfolioUrls?.length > 0) score += 5;
  if (user.locationCity) score += 5;
  return Math.min(score, 100);
}

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;
