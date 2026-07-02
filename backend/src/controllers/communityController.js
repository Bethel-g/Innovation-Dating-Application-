import { Op } from 'sequelize';
import Community from '../models/Community.js';
import CommunityMember from '../models/CommunityMember.js';
import { jsonbContains } from '../utils/jsonContains.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

export const createCommunity = async (req, res) => {
  try {
    const community = await Community.create({ ...req.body, author: req.userId });
    await CommunityMember.create({
      community: community.id,
      user: req.userId,
      role: 'admin',
      status: 'approved',
      joinedAt: new Date(),
    });
    await community.increment('memberCount');
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommunities = async (req, res) => {
  try {
    const { page = 1, limit = 20, focus, visibility } = req.query;
    const where = {};
    if (focus) where.innovationFocus = focus;
    if (visibility) where.visibility = visibility;
    else where.visibility = { [Op.ne]: 'invite_only' };

    const communities = await Community.findAll({
      where,
      order: [['memberCount', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const communityIds = communities.map(c => c.id);
    const memberships = await CommunityMember.findAll({
      where: { community: communityIds, role: 'admin', status: 'approved' },
    });
    const adminIds = [...new Set(memberships.map(m => m.user))];
    const admins = await User.findAll({
      where: { id: adminIds },
      attributes: ['id', 'name', 'photos'],
    });
    const adminMap = Object.fromEntries(admins.map(a => [a.id, a.toJSON()]));
    const adminForCommunity = {};
    memberships.forEach(m => { adminForCommunity[m.community] = adminMap[m.user] || null; });

    const enriched = communities.map(c => ({
      ...c.toJSON(),
      admin: adminForCommunity[c.id] || null,
    }));

    const total = await Community.count({ where });
    res.json({ communities: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findByPk(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const members = await CommunityMember.findAll({
      where: { community: community.id, status: 'approved' },
    });
    const userIds = members.map(m => m.user);
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'photos', 'healthSpecialty'],
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u.toJSON()]));

    const enrichedMembers = members.map(m => ({
      ...m.toJSON(),
      user: userMap[m.user] || { id: m.user },
    }));

    const myMembership = await CommunityMember.findOne({
      where: { community: community.id, user: req.userId },
    });

    const posts = await Post.findAll({
      where: { [Op.and]: [jsonbContains('tags', community.id), { isDraft: false }] },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    res.json({
      ...community.toJSON(),
      members: enrichedMembers,
      myMembership,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findByPk(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const existing = await CommunityMember.findOne({
      where: { community: community.id, user: req.userId },
    });
    if (existing) {
      if (existing.status === 'approved') return res.status(400).json({ message: 'Already a member' });
      if (existing.status === 'pending') return res.status(400).json({ message: 'Request already pending' });
      existing.status = community.visibility === 'public' ? 'approved' : 'pending';
      if (existing.status === 'approved') existing.joinedAt = new Date();
      await existing.save();
      if (existing.status === 'approved') await community.increment('memberCount');
      return res.json(existing);
    }

    const status = community.visibility === 'public' ? 'approved' : 'pending';
    const membership = await CommunityMember.create({
      community: community.id,
      user: req.userId,
      status,
      joinedAt: status === 'approved' ? new Date() : null,
    });
    if (status === 'approved') await community.increment('memberCount');

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const membership = await CommunityMember.findOne({
      where: { community: req.params.id, user: req.userId, status: 'approved' },
    });
    if (!membership) return res.status(404).json({ message: 'Not a member' });

    if (membership.role === 'admin') {
      const otherAdmins = await CommunityMember.count({
        where: { community: req.params.id, role: 'admin', status: 'approved', user: { [Op.ne]: req.userId } },
      });
      if (otherAdmins === 0) return res.status(400).json({ message: 'Transfer admin role before leaving' });
    }

    membership.status = 'left';
    await membership.save();
    await Community.decrement('memberCount', { where: { id: req.params.id } });
    res.json({ message: 'Left community' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCommunities = async (req, res) => {
  try {
    const memberships = await CommunityMember.findAll({
      where: { user: req.userId, status: 'approved' },
    });
    const communityIds = memberships.map(m => m.community);

    const communities = await Community.findAll({
      where: { id: communityIds },
      order: [['memberCount', 'DESC']],
    });

    const roleMap = Object.fromEntries(memberships.map(m => [m.community, m.role]));

    const enriched = communities.map(c => ({
      ...c.toJSON(),
      myRole: roleMap[c.id] || null,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCommunity = async (req, res) => {
  try {
    const membership = await CommunityMember.findOne({
      where: { community: req.params.id, user: req.userId, role: 'admin', status: 'approved' },
    });
    if (!membership) return res.status(403).json({ message: 'Only admins can update' });

    const community = await Community.findByPk(req.params.id);
    await community.update(req.body);
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
