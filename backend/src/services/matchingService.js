import { Op } from 'sequelize';
import User from '../models/User.js';
import Match from '../models/Match.js';
import { jsonbContains } from '../utils/jsonContains.js';

const MAX_LOOKUP = 100;

export const calculateCompatibility = (user1, user2) => {
  let score = 0;
  const weights = {
    healthSpecialty: 25,
    innovationFocus: 20,
    workSetting: 10,
    interests: 15,
    personality: 10,
    location: 10,
    collaborationIntent: 10,
  };

  if (user1.healthSpecialty && user2.healthSpecialty) {
    if (user1.healthSpecialty === user2.healthSpecialty) {
      score += weights.healthSpecialty;
    } else {
      const related = getRelatedSpecialties(user1.healthSpecialty);
      if (related.includes(user2.healthSpecialty)) score += weights.healthSpecialty * 0.6;
    }
  }

  if (user1.innovationFocus && user2.innovationFocus) {
    if (user1.innovationFocus === user2.innovationFocus) {
      score += weights.innovationFocus;
    }
  }

  if (user1.workSetting && user2.workSetting) {
    if (user1.workSetting === user2.workSetting) score += weights.workSetting;
  }

  const interests1 = user1.interests || [];
  const interests2 = user2.interests || [];
  if (interests1.length && interests2.length) {
    const common = interests1.filter(i => interests2.includes(i));
    score += (common.length / Math.max(interests1.length, interests2.length)) * weights.interests;
  }

  if (user1.personalityTraits?.length && user2.personalityTraits?.length) {
    const common = user1.personalityTraits.filter(t => user2.personalityTraits.includes(t));
    score += (common.length / Math.max(user1.personalityTraits.length, user2.personalityTraits.length)) * weights.personality;
  }

  const dist = getDistance(user1.locationLat, user1.locationLng, user2.locationLat, user2.locationLng);
  if (dist !== null) {
    if (dist < 10) score += weights.location;
    else if (dist < 50) score += 7;
    else if (dist < 100) score += 4;
    else score += 2;
  }

  if (user1.collaborationIntent && user2.collaborationIntent) {
    if (user1.collaborationIntent === user2.collaborationIntent) score += weights.collaborationIntent;
    else if (user1.collaborationIntent === 'open' || user2.collaborationIntent === 'open') score += 5;
  }

  return Math.min(score, 100);
};

function getRelatedSpecialties(specialty) {
  const groups = {
    cardiology: ['general_medicine', 'emergency_medicine'],
    neurology: ['psychiatry', 'general_medicine'],
    oncology: ['research', 'general_medicine'],
    psychiatry: ['mental_health', 'neurology', 'telemedicine'],
    public_health: ['epidemiology', 'health_administration', 'health_informatics'],
    nursing: ['general_medicine', 'emergency_medicine'],
    biotechnology: ['research', 'medtech', 'pharmacy'],
    medtech: ['biotechnology', 'telemedicine', 'health_informatics'],
    telemedicine: ['health_informatics', 'medtech', 'mental_health'],
    health_informatics: ['telemedicine', 'public_health', 'biotechnology'],
  };
  return groups[specialty] || [];
}

export const findPotentialMatches = async (userId, limit = 20) => {
  const user = await User.findByPk(userId);
  if (!user) return [];

  const where = { id: { [Op.ne]: userId }, isActive: true };
  const genderPref = user.genderPreference || [];
  if (genderPref.length) where.gender = { [Op.in]: genderPref };

  if (user.ageRangeMin || user.ageRangeMax) {
    const minDate = new Date(); minDate.setFullYear(minDate.getFullYear() - (user.ageRangeMax || 60));
    const maxDate = new Date(); maxDate.setFullYear(maxDate.getFullYear() - (user.ageRangeMin || 18));
    where.dateOfBirth = { [Op.between]: [minDate, maxDate] };
  }

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

export const findHealthSectorMatches = async (userId, limit = 20) => {
  const user = await User.findByPk(userId);
  if (!user) return [];

  const where = { id: { [Op.ne]: userId }, isActive: true, healthSpecialty: { [Op.ne]: null } };

  const existingMatches = await Match.findAll({
    where: { [Op.or]: [{ initiator: userId }, jsonbContains('users', userId)] },
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

export const findProjectCollaborators = async (project, limit = 10) => {
  const skillsNeeded = project.skillsNeeded || [];
  if (!skillsNeeded.length) return [];

  const candidates = await User.findAll({
    where: {
      isActive: true,
      availableForProjects: true,
      innovationFocus: project.innovationFocus || { [Op.ne]: null },
    },
    attributes: { exclude: ['password'] },
    limit: MAX_LOOKUP,
  });

  const scored = candidates.map(u => {
    let score = 0;
    const userSkills = [...(u.interests || []), ...(u.personalityTraits || [])];
    const matchedSkills = skillsNeeded.filter(s => userSkills.includes(s));
    score += (matchedSkills.length / skillsNeeded.length) * 50;
    if (u.healthSpecialty) score += 20;
    if (u.yearsOfExperience >= 3) score += 15;
    if (u.lookingForTeam) score += 15;
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

function getUserAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}
