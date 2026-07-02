import { Op, fn, col, literal } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from '../models/User.js';
import Report from '../models/Report.js';
import { jsonbContains } from '../utils/jsonContains.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import Subscription from '../models/Subscription.js';
import NotificationCampaign from '../models/NotificationCampaign.js';
import Notification from '../models/Notification.js';
import { processCampaign } from '../services/notificationService.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, activeUsers, verifiedUsers, totalMatches,
      totalReports, pendingReports, premiumSubscriptions, messagesToday,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isOnline: true } }),
      User.count({ where: { isVerified: true } }),
      Match.count({ where: { status: 'matched' } }),
      Report.count(),
      Report.count({ where: { status: 'pending' } }),
      Subscription.count({ where: { isActive: true, tier: { [Op.ne]: 'free' } } }),
      Message.count({
        where: { createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);

    res.json({
      totalUsers, activeUsers, verifiedUsers, totalMatches,
      totalReports, pendingReports, premiumSubscriptions, messagesToday,
      matchRate: totalUsers > 0 ? ((totalMatches / totalUsers) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, isVerified } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const total = await User.count({ where });

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [matches, reports, subscription] = await Promise.all([
      Match.count({ where: { [Op.and]: [jsonbContains('users', req.params.id), { status: 'matched' }] } }),
      Report.findAll({ where: { reported: req.params.id } }),
      Subscription.findOne({ where: { user: req.params.id, isActive: true } }),
    ]);

    res.json({ user, matches, reports, subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { isActive, isVerified, subscriptionTier, name, email, role, permissions } = req.body;
    const updates = {};

    if (isActive !== undefined) updates.isActive = isActive;
    if (isVerified !== undefined) updates.isVerified = isVerified;
    if (subscriptionTier) updates.subscriptionTier = subscriptionTier;
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (permissions) updates.permissions = permissions;

    const [affected] = await User.update(updates, { where: { id: req.params.id } });
    if (!affected) return res.status(404).json({ message: 'User not found' });

    const user = await User.findByPk(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.update({ isActive: false }, { where: { id: req.params.id } });
    res.json({ message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;

    const reports = await Report.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const total = await Report.count({ where });

    const userIds = new Set();
    reports.forEach(r => { userIds.add(r.reporter); userIds.add(r.reported); });
    const users = await User.findAll({
      where: { id: [...userIds] },
      attributes: ['id', 'name', 'email'],
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u.toJSON()]));

    const enriched = reports.map(r => ({
      ...r.toJSON(),
      reporter: userMap[r.reporter] || { id: r.reporter },
      reported: userMap[r.reported] || { id: r.reported },
    }));

    res.json({ reports: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { status, resolution, actionTaken } = req.body;
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status || report.status;
    report.resolution = resolution || report.resolution;
    report.actionTaken = actionTaken || report.actionTaken;
    report.reviewedBy = req.userId;
    await report.save();

    if (actionTaken === 'warn' || actionTaken === 'ban') {
      await User.update(
        { isActive: actionTaken !== 'ban' },
        { where: { id: report.reported } }
      );
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlaggedMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.findAll({
      where: { isFlagged: true },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const total = await Message.count({ where: { isFlagged: true } });

    const senderIds = [...new Set(messages.map(m => m.sender))];
    const senders = await User.findAll({
      where: { id: senderIds },
      attributes: ['id', 'name'],
    });
    const senderMap = Object.fromEntries(senders.map(s => [s.id, s.toJSON()]));

    const enriched = messages.map(m => ({
      ...m.toJSON(),
      sender: senderMap[m.sender] || { id: m.sender },
    }));

    res.json({ messages: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moderateMessage = async (req, res) => {
  try {
    const { action } = req.body;
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (action === 'approve') {
      message.isFlagged = false;
      message.flagReason = null;
    } else if (action === 'delete') {
      message.content = '[Message removed by moderator]';
      message.isFlagged = false;
    }

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = parseInt(period) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [userGrowth, matchTrend, messageTrend, subscriptionRevenue, dailyActiveUsers] =
      await Promise.all([
        User.findAll({
          attributes: [
            [fn('DATE', col('createdAt')), 'date'],
            [fn('COUNT', col('id')), 'count'],
          ],
          where: { createdAt: { [Op.gte]: since } },
          group: ['date'],
          order: [['date', 'ASC']],
          raw: true,
        }),
        Match.findAll({
          attributes: [
            [fn('DATE', col('matchedAt')), 'date'],
            [fn('COUNT', col('id')), 'count'],
          ],
          where: { matchedAt: { [Op.gte]: since } },
          group: ['date'],
          order: [['date', 'ASC']],
          raw: true,
        }),
        Message.findAll({
          attributes: [
            [fn('DATE', col('createdAt')), 'date'],
            [fn('COUNT', col('id')), 'count'],
          ],
          where: { createdAt: { [Op.gte]: since } },
          group: ['date'],
          order: [['date', 'ASC']],
          raw: true,
        }),
        Subscription.findAll({
          attributes: [
            [fn('SUM', col('amount')), 'total'],
            [fn('COUNT', col('id')), 'count'],
          ],
          where: { createdAt: { [Op.gte]: since }, amount: { [Op.ne]: null } },
          raw: true,
        }),
        User.count({ where: { lastActive: { [Op.gte]: since }, isActive: true } }),
      ]);

    const genderDistribution = await User.findAll({
      attributes: ['gender', [fn('COUNT', col('id')), 'count']],
      where: { gender: { [Op.ne]: null } },
      group: ['gender'],
      raw: true,
    });

    const formatTrend = (rows) =>
      rows.map(r => ({ _id: r.date, count: parseInt(r.count) }));

    res.json({
      userGrowth: formatTrend(userGrowth),
      matchTrend: formatTrend(matchTrend),
      messageTrend: formatTrend(messageTrend),
      subscriptionRevenue: subscriptionRevenue[0]?.total || 0,
      totalRevenue: subscriptionRevenue[0]?.count || 0,
      dailyActiveUsers,
      genderDistribution: genderDistribution.map(g => ({ _id: g.gender, count: parseInt(g.count) })),
      period: days,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await NotificationCampaign.findAll({
      order: [['createdAt', 'DESC']],
    });

    const userIds = [...new Set(campaigns.map(c => c.createdBy).filter(Boolean))];
    const creators = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'email'],
    });
    const creatorMap = Object.fromEntries(creators.map(c => [c.id, c.toJSON()]));

    const enriched = campaigns.map(c => ({
      ...c.toJSON(),
      createdBy: creatorMap[c.createdBy] || null,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const campaign = await NotificationCampaign.create({
      ...req.body,
      createdBy: req.userId,
    });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendCampaign = async (req, res) => {
  try {
    const campaign = await NotificationCampaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    campaign.status = 'scheduled';
    await campaign.save();

    await processCampaign(campaign.id);
    res.json({ message: 'Campaign sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
