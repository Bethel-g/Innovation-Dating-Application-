import { Op } from 'sequelize';
import User from '../models/User.js';
import Badge from '../models/Badge.js';
import Contribution from '../models/Contribution.js';
import Endorsement from '../models/Endorsement.js';
import Review from '../models/Review.js';
import { BADGE_TYPES, CONTRIBUTION_POINTS } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';

export const addContribution = async (userId, type, referenceId = null, referenceType = null, description = null) => {
  const points = CONTRIBUTION_POINTS[type] || 10;
  const contribution = await Contribution.create({
    user: userId,
    type,
    points,
    referenceId,
    referenceType,
    description,
  });

  await User.increment('reputationScore', { by: points, where: { id: userId } });

  const totalContributions = await Contribution.count({ where: { user: userId } });
  if (totalContributions >= 10) {
    await checkAndAwardBadges(userId);
  }

  return contribution;
};

export const checkAndAwardBadges = async (userId) => {
  const projectCount = await Contribution.count({
    where: { user: userId, type: 'project_complete' },
  });
  const taskCount = await Contribution.count({
    where: { user: userId, type: 'task_complete' },
  });
  const reviewCount = await Contribution.count({
    where: { user: userId, type: 'review_given' },
  });

  const badgesToAward = [];

  if (projectCount >= 1) {
    badgesToAward.push({ type: BADGE_TYPES.FIRST_PROJECT, reason: 'Completed first project' });
  }
  if (projectCount >= 10) {
    badgesToAward.push({ type: BADGE_TYPES.TEN_PROJECTS, reason: 'Completed 10 projects' });
  }
  if (taskCount >= 50) {
    badgesToAward.push({ type: BADGE_TYPES.TOP_DEVELOPER, reason: 'Completed 50 tasks' });
  }
  if (reviewCount >= 5) {
    badgesToAward.push({ type: BADGE_TYPES.HELPFUL_REVIEW, reason: 'Given 5+ reviews' });
  }

  for (const badge of badgesToAward) {
    const existing = await Badge.findOne({
      where: { user: userId, type: badge.type },
    });
    if (!existing) {
      await Badge.create({ ...badge, user: userId });
    }
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const users = await User.findAll({
      where: { reputationScore: { [Op.gt]: 0 } },
      attributes: ['id', 'name', 'photos', 'reputationScore', 'reputationLevel', 'healthSpecialty'],
      order: [['reputationScore', 'DESC']],
      limit: parseInt(limit),
    });

    const enriched = users.map((u, index) => ({
      ...u.toJSON(),
      rank: index + 1,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserContributions = async (req, res) => {
  try {
    const contributions = await Contribution.findAll({
      where: { user: req.params.userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    const totalPoints = contributions.reduce((sum, c) => sum + c.points, 0);
    const badges = await Badge.findAll({
      where: { user: req.params.userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({ contributions, totalPoints, badges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endorseSkill = async (req, res) => {
  try {
    const { userId, skill, comment } = req.body;

    if (userId === req.userId) return res.status(400).json({ message: 'Cannot endorse yourself' });

    const existing = await Endorsement.findOne({
      where: { endorser: req.userId, endorsed: userId, skill },
    });
    if (existing) return res.status(400).json({ message: 'Already endorsed this skill' });

    await Endorsement.create({
      endorser: req.userId,
      endorsed: userId,
      skill,
      comment,
    });

    await User.increment('endorsementCount', { by: 1, where: { id: userId } });

    await addContribution(req.userId, 'endorsement_given');

    await createNotification({
      user: userId,
      type: 'skill_endorsed',
      title: 'Skill endorsed!',
      body: `Someone endorsed your "${skill}" skill`,
      data: { skill },
    });

    res.json({ message: 'Skill endorsed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserEndorsements = async (req, res) => {
  try {
    const endorsements = await Endorsement.findAll({
      where: { endorsed: req.params.userId },
      order: [['createdAt', 'DESC']],
    });

    const skillCounts = {};
    for (const e of endorsements) {
      skillCounts[e.skill] = (skillCounts[e.skill] || 0) + 1;
    }

    res.json({ endorsements, skillCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { reviewed, project, rating, comment, skills } = req.body;

    if (reviewed === req.userId) return res.status(400).json({ message: 'Cannot review yourself' });

    const existing = await Review.findOne({
      where: { reviewer: req.userId, reviewed, project },
    });
    if (existing) return res.status(400).json({ message: 'Already reviewed this user for this project' });

    const review = await Review.create({
      reviewer: req.userId,
      reviewed,
      project,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      skills,
    });

    await addContribution(req.userId, 'review_given', review.id, 'review');

    await createNotification({
      user: reviewed,
      type: 'review_received',
      title: 'New review received',
      body: `You received a ${rating}-star review`,
      data: { reviewId: review.id, projectId: project },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { reviewed: req.params.userId },
      order: [['createdAt', 'DESC']],
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const reviewerIds = [...new Set(reviews.map(r => r.reviewer))];
    const reviewers = reviewerIds.length > 0
      ? await User.findAll({ where: { id: reviewerIds }, attributes: ['id', 'name', 'photos'] })
      : [];
    const reviewerMap = Object.fromEntries(reviewers.map(r => [r.id, r.toJSON()]));

    const enriched = reviews.map(r => ({
      ...r.toJSON(),
      reviewer: reviewerMap[r.reviewer] || { id: r.reviewer },
    }));

    res.json({ reviews: enriched, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBadges = async (req, res) => {
  try {
    const badges = await Badge.findAll({
      where: { user: req.params.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
