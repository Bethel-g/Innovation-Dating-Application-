import { Op } from 'sequelize';
import User from '../models/User.js';
import Match from '../models/Match.js';
import { jsonbContains } from '../utils/jsonContains.js';

const MAX_LOOKUP = 100;

export const calculateCompatibility = (user1, user2) => {
  let score = 0;
  const weights = {
    skills: 30,
    intents: 20,
    interests: 15,
    experience: 10,
    location: 10,
    role: 15,
  };

  // Skills overlap
  const skills1 = [...(user1.primarySkills || []), ...(user1.secondarySkills || []), ...(user1.skills || [])];
  const skills2 = [...(user2.primarySkills || []), ...(user2.secondarySkills || []), ...(user2.skills || [])];
  if (skills1.length && skills2.length) {
    const common = skills1.filter(s => skills2.includes(s));
    score += (common.length / Math.max(skills1.length, skills2.length)) * weights.skills;
  }

  // Intent match
  const intents1 = user1.intents || [];
  const intents2 = user2.intents || [];
  if (intents1.length && intents2.length) {
    const common = intents1.filter(i => intents2.includes(i));
    if (common.length > 0) score += weights.intents;
    else if (intents1.includes('open') || intents2.includes('open')) score += weights.intents * 0.5;
  }

  // Interests overlap
  const interests1 = user1.interests || [];
  const interests2 = user2.interests || [];
  if (interests1.length && interests2.length) {
    const common = interests1.filter(i => interests2.includes(i));
    score += (common.length / Math.max(interests1.length, interests2.length)) * weights.interests;
  }

  // Experience level similarity
  const levels = ['student', 'junior', 'mid', 'senior', 'lead', 'vp', 'c-level'];
  const idx1 = levels.indexOf(user1.experienceLevel);
  const idx2 = levels.indexOf(user2.experienceLevel);
  if (idx1 >= 0 && idx2 >= 0) {
    const diff = Math.abs(idx1 - idx2);
    if (diff <= 1) score += weights.experience;
    else if (diff <= 2) score += weights.experience * 0.5;
  }

  // Location proximity
  const dist = getDistance(user1.locationLat, user1.locationLng, user2.locationLat, user2.locationLng);
  if (dist !== null) {
    if (dist < 10) score += weights.location;
    else if (dist < 50) score += 7;
    else if (dist < 100) score += 4;
    else score += 2;
  }

  // Role complementarity
  const role1 = user1.role || 'user';
  const role2 = user2.role || 'user';
  if (role1 !== role2) score += weights.role;
  if (role1 === 'mentor' || role2 === 'mentor') score += 5;

  return Math.min(Math.round(score), 100);
};

export const findPotentialMatches = async (userId, limit = 20) => {
  const user = await User.findByPk(userId);
  if (!user) return [];

  const where = { id: { [Op.ne]: userId }, isActive: true };

  const existingMatches = await Match.findAll({
    where: {
      [Op.or]: [
        { initiator: userId },
        jsonbContains('users', userId),
      ],
    },
    attributes: ['users', 'initiator'],
  });

  const excludedIds = new Set([userId]);
  existingMatches.forEach(m => {
    (m.users || []).forEach(u => excludedIds.add(u));
    if (m.initiator) excludedIds.add(m.initiator);
  });
  where.id = { [Op.notIn]: [...excludedIds] };

  const candidates = await User.findAll({
    where,
    attributes: { exclude: ['password'] },
    limit: MAX_LOOKUP,
  });

  const scored = candidates.map(c => ({
    user: c,
    compatibilityScore: calculateCompatibility(user, c),
  }));

  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  return scored.slice(0, limit);
};

export const getDailySuggestions = async (userId) => findPotentialMatches(userId, 10);

export const findProjectCollaborators = async (project, limit = 10) => {
  const skillsNeeded = project.skillsNeeded || [];
  if (!skillsNeeded.length) return [];

  const candidates = await User.findAll({
    where: {
      isActive: true,
      availableForProjects: true,
    },
    attributes: { exclude: ['password'] },
    limit: MAX_LOOKUP,
  });

  const scored = candidates.map(u => {
    let score = 0;
    const userSkills = [...(u.skills || []), ...(u.primarySkills || []), ...(u.secondarySkills || [])];
    const matchedSkills = skillsNeeded.filter(s => userSkills.includes(s));
    score += (matchedSkills.length / skillsNeeded.length) * 50;
    if (u.yearsOfExperience >= 3) score += 20;
    if (u.lookingForTeam) score += 15;
    if ((u.intents || []).includes('collaborate')) score += 15;
    return { user: u, compatibilityScore: Math.min(score, 100) };
  });

  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  return scored.slice(0, limit);
};

function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * (Math.PI / 180); }
