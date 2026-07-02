import { Op } from 'sequelize';
import Match from '../models/Match.js';
import User from '../models/User.js';
import { findPotentialMatches, findHealthSectorMatches, calculateCompatibility } from '../services/matchingService.js';
import { jsonbContains } from '../utils/jsonContains.js';
import { sendMatchNotification, sendLikeNotification, sendSuggestionNotification } from '../services/notificationService.js';
import { generateMatchInsight } from '../services/aiService.js';

export const swipe = async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    const userId = req.userId;
    const isSuperLike = action === 'super_like';

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'Cannot swipe on yourself' });
    }

    let match = await Match.findOne({
      where: jsonbContains('users', [userId, targetUserId]),
    });

    if (match && match.status === 'blocked') {
      return res.status(403).json({ message: 'Cannot interact with blocked user' });
    }

    const user = await User.findByPk(userId);
    if (!isSuperLike && user.subscriptionTier === 'free') {
      if (user.dailySwipes >= user.maxDailySwipes) {
        return res.status(429).json({ message: 'Daily swipe limit reached' });
      }
    }

    if (match) {
      if (!isSuperLike && match.status === 'pending') match.status = 'liked';
      else if (isSuperLike) match.status = 'super_liked';
      await match.save();

      const userIds = match.users;
      const otherLiked = (
        (match.status === 'liked' && match.initiator !== userId) ||
        match.status === 'super_liked'
      );

      if (otherLiked) {
        match.status = 'matched';
        match.matchedAt = new Date();
        await match.save();
        await User.update(
          { dailySwipes: sequelize.literal('"dailySwipes" + 1') },
          { where: { id: userId } }
        );
        await sendMatchNotification(userId, targetUserId);
        const users = await User.findAll({ where: { id: userIds } });
        return res.json({ match: { ...match.toJSON(), users }, isMatch: true });
      }

      await sendLikeNotification(userId, targetUserId, isSuperLike ? 'super_like' : 'profile_like');
      await User.update(
        { dailySwipes: sequelize.literal('"dailySwipes" + 1') },
        { where: { id: userId } }
      );

      const users = await User.findAll({ where: { id: match.users } });
      return res.json({ match: { ...match.toJSON(), users }, isMatch: false });
    }

    match = await Match.create({
      users: [userId, targetUserId],
      initiator: userId,
      status: isSuperLike ? 'super_liked' : 'liked',
    });

    await User.update(
      { dailySwipes: sequelize.literal('"dailySwipes" + 1') },
      { where: { id: userId } }
    );
    await sendLikeNotification(userId, targetUserId, isSuperLike ? 'super_like' : 'profile_like');

    const users = await User.findAll({ where: { id: match.users } });
    res.json({ match: { ...match.toJSON(), users }, isMatch: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatches = async (req, res) => {
  try {
    const allMatches = await Match.findAll({
      where: { [Op.and]: [jsonbContains('users', req.userId), { status: 'matched' }] },
      order: [['matchedAt', 'DESC']],
    });

    const results = await Promise.all(
      allMatches.map(async (match) => {
        const users = await User.findAll({ where: { id: match.users } });
        return { ...match.toJSON(), users };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPotentialMatches = async (req, res) => {
  try {
    const matches = await findPotentialMatches(req.userId);
    const results = await Promise.all(
      matches.map(async ({ user, compatibilityScore }) => {
        const currentUser = await User.findByPk(req.userId);
        const insight = generateMatchInsight(currentUser, user, compatibilityScore);
        return { user, compatibilityScore, insight };
      })
    );

    await Promise.all(
      results
        .filter(r => r.compatibilityScore > 70)
        .slice(0, 3)
        .map(r => sendSuggestionNotification(req.userId, r.user.id, r.compatibilityScore))
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailySuggestions = async (req, res) => {
  try {
    const matches = await findPotentialMatches(req.userId, 10);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthSectorMatches = async (req, res) => {
  try {
    const matches = await findHealthSectorMatches(req.userId, 20);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatchInsight = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const users = await User.findAll({ where: { id: match.users } });
    const user1 = users[0];
    const user2 = users[1];
    const score = calculateCompatibility(user1, user2);
    const insight = generateMatchInsight(user1, user2, score);

    res.json(insight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { targetUserId } = req.body;

    let match = await Match.findOne({
      where: jsonbContains('users', [req.userId, targetUserId]),
    });

    if (match) {
      match.status = 'blocked';
      match.blockedBy = req.userId;
      await match.save();
    } else {
      match = await Match.create({
        users: [req.userId, targetUserId],
        initiator: req.userId,
        status: 'blocked',
        blockedBy: req.userId,
      });
    }

    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSwipeCount = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    res.json({
      used: user.dailySwipes,
      max: user.maxDailySwipes,
      remaining: Math.max(0, user.maxDailySwipes - user.dailySwipes),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetDailySwipes = async (req, res) => {
  try {
    await User.update({ dailySwipes: 0 }, { where: {} });
    res.json({ message: 'Daily swipes reset' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
