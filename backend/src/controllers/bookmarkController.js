import Bookmark from '../models/Bookmark.js';
import Idea from '../models/Idea.js';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail, notFound } from '../utils/apiResponse.js';
import { BOOKMARK_TARGET_TYPE } from '../config/constants.js';

const targetExists = async (targetType, targetId) => {
  if (targetType === 'idea') return Boolean(await Idea.findByPk(targetId));
  if (targetType === 'opportunity') return Boolean(await Opportunity.findByPk(targetId));
  if (targetType === 'user') return Boolean(await User.findByPk(targetId));
  return false;
};

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.body;
  if (!Object.values(BOOKMARK_TARGET_TYPE).includes(targetType)) {
    return fail(res, 400, 'targetType must be one of: idea, user, opportunity');
  }

  if (!await targetExists(targetType, targetId)) return notFound(res, 'Target');

  const existing = await Bookmark.findOne({ where: { user: req.userId, targetType, targetId } });

  if (existing) {
    await existing.destroy();
    return success(res, { bookmarked: false }, 'Removed from bookmarks');
  }

  await Bookmark.create({ user: req.userId, targetType, targetId });
  created(res, { bookmarked: true }, 'Added to bookmarks');
});

export const listBookmarks = asyncHandler(async (req, res) => {
  const { targetType } = req.query;

  const where = { user: req.userId };
  if (targetType) where.targetType = targetType;

  const bookmarks = await Bookmark.findAll({ where, order: [['createdAt', 'DESC']] });

  const ideaIds = bookmarks.filter(b => b.targetType === 'idea').map(b => b.targetId);
  const oppIds = bookmarks.filter(b => b.targetType === 'opportunity').map(b => b.targetId);
  const userIds = bookmarks.filter(b => b.targetType === 'user').map(b => b.targetId);

  const [ideas, opportunities, users, orgs] = await Promise.all([
    ideaIds.length ? Idea.findAll({
      where: { id: ideaIds },
      include: [{ model: User, as: 'authorDetail', attributes: ['id', 'name', 'photos', 'role', 'isVerified'] }],
    }) : [],
    oppIds.length ? Opportunity.findAll({
      where: { id: oppIds },
      include: [{ model: Organization, as: 'organizationDetail', attributes: ['id', 'name', 'type', 'verified'] }],
    }) : [],
    userIds.length ? User.findAll({ where: { id: userIds }, attributes: { exclude: ['password'] } }) : [],
    Promise.resolve([]),
  ]);

  const ideaMap = Object.fromEntries(ideas.map(i => [i.id, i]));
  const oppMap = Object.fromEntries(opportunities.map(o => [o.id, o]));
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const enriched = bookmarks.map(b => ({
    ...b.toJSON(),
    target: b.targetType === 'idea' ? ideaMap[b.targetId]
      : b.targetType === 'opportunity' ? oppMap[b.targetId]
      : userMap[b.targetId] || null,
  }));

  success(res, enriched, 'Bookmarks fetched');
});