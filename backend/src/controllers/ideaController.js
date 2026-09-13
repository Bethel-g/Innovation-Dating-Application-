import { Op } from 'sequelize';
import Idea from '../models/Idea.js';
import User from '../models/User.js';
import Like from '../models/Like.js';
import TeamRole from '../models/TeamRole.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import Connection from '../models/Connection.js';
import { findCollaboratorsForIdea } from '../services/matchingService.js';
import { createNotification } from '../services/notificationService.js';
import { sendConnectionRequest, notifyConnectionRequest } from '../services/connectionService.js';
import { getOrCreateTeamForIdea } from '../services/teamService.js';
import { jsonbContains } from '../utils/jsonContains.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail, notFound } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { IDEA_STATUS } from '../config/constants.js';

const IDEA_UPDATE_FIELDS = [
  'title', 'description', 'problemStatement', 'proposedSolution', 'desiredOutcome',
  'category', 'sector', 'stage', 'skillsNeeded', 'rolesNeeded', 'tags',
  'attachments', 'visibility', 'isLookingForCoFounder',
];

export const createIdea = asyncHandler(async (req, res) => {
  const openRoles = Array.isArray(req.body.openRoles) ? req.body.openRoles : [];
  const { openRoles: _ignored, ...payload } = req.body;

  const idea = await Idea.create({ ...payload, author: req.userId });

  const roles = [];
  for (const role of openRoles) {
    roles.push(await TeamRole.create({
      idea: idea.id,
      title: role.title,
      roleType: role.roleType || role.type || 'other',
      description: role.description || null,
      skillsNeeded: role.skillsNeeded || [],
      status: 'open',
    }));
  }

  created(res, { ...idea.toJSON(), openRoles: roles }, 'Idea published successfully');
});

export const getIdeas = asyncHandler(async (req, res) => {
  const { page, limit, offset, order } = parsePagination(req.query);
  const { status, sector, stage, category, skill, q = '' } = req.query;

  const where = {};
  if (status) where.status = status;
  if (sector) where.sector = sector;
  if (stage) where.stage = stage;
  if (category) where.category = category;
  if (skill) where.skillsNeeded = jsonbContains('Idea.skillsNeeded', skill);
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } },
    ];
  }
  if (req.query.mine === 'true') where.author = req.userId;

  const { count, rows: ideas } = await Idea.findAndCountAll({
    where,
    distinct: true,
    include: [
      { model: User, as: 'authorDetail', attributes: ['id', 'name', 'headline', 'role', 'isVerified', 'photos', 'organizationId'] },
      { model: TeamRole, as: 'openRoles', where: { status: 'open' }, required: false },
    ],
    order,
    offset,
    limit,
  });

  success(res, ideas, 'Ideas fetched', paginationMeta(page, limit, count));
});

export const getIdeaById = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id, {
    include: [
      { model: User, as: 'authorDetail', attributes: { exclude: ['password'] } },
      { model: TeamRole, as: 'openRoles' },
      { model: Team, as: 'team', include: [{ model: TeamMember, as: 'members', include: [{ model: User, as: 'profile', attributes: ['id', 'name', 'headline', 'role', 'photos'] }] }] },
    ],
  });
  if (!idea) return notFound(res, 'Idea');

  await idea.update({ viewCount: (idea.viewCount || 0) + 1 });
  success(res, idea, 'Idea fetched');
});

export const updateIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) return notFound(res, 'Idea');
  if (idea.author !== req.userId) return fail(res, 403, 'Only the author can update this idea');

  const updates = {};
  for (const field of IDEA_UPDATE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  await idea.update(updates);
  success(res, idea, 'Idea updated');
});

export const updateIdeaStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!Object.values(IDEA_STATUS).includes(status)) {
    return fail(res, 400, `status must be one of: ${Object.values(IDEA_STATUS).join(', ')}`);
  }

  const idea = await Idea.findByPk(req.params.id);
  if (!idea) return notFound(res, 'Idea');
  if (idea.author !== req.userId) return fail(res, 403, 'Only the author can update status');

  if (status === IDEA_STATUS.TEAM_FORMED) {
    const team = await getOrCreateTeamForIdea(idea.id);
    await idea.update({ status });
    return success(res, { idea, team }, 'Team marked as formed');
  }

  await idea.update({ status });
  success(res, idea, 'Idea status updated');
});

export const deleteIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) return notFound(res, 'Idea');
  const isAdmin = ['admin', 'moderator', 'support'].includes(req.user.role);
  if (idea.author !== req.userId && !isAdmin) return fail(res, 403, 'Only the author can delete this idea');

  await idea.destroy();
  success(res, null, 'Idea deleted');
});

export const expressInterest = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) return notFound(res, 'Idea');

  if (idea.author === req.userId) return fail(res, 400, 'You cannot express interest in your own idea');

  const { connection, already } = await sendConnectionRequest({
    requester: req.userId,
    recipient: idea.author,
    ideaId: idea.id,
    note: req.body.note || req.body.message || '',
  });

  if (!already) await notifyConnectionRequest(connection);

  success(res, { connectionId: connection.id, status: connection.status }, already
    ? 'You already expressed interest in this idea'
    : 'Interest sent to the idea owner');
});

export const likeIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) return notFound(res, 'Idea');

  const existing = await Like.findOne({
    where: { user: req.userId, targetType: 'idea', targetId: req.params.id },
  });

  if (existing) {
    await existing.destroy();
    await idea.update({ likeCount: Math.max(0, idea.likeCount - 1) });
    return success(res, { liked: false, likeCount: idea.likeCount });
  }

  await Like.create({ user: req.userId, targetType: 'idea', targetId: req.params.id });
  await idea.update({ likeCount: idea.likeCount + 1 });

  if (idea.author !== req.userId) {
    await createNotification({
      user: idea.author,
      type: 'reaction',
      title: 'Your idea was liked',
      body: `Someone liked your idea "${idea.title}"`,
      data: { ideaId: idea.id },
    });
  }

  success(res, { liked: true, likeCount: idea.likeCount });
});

// ===== Open roles (team formation) =====

export const addOpenRole = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) return notFound(res, 'Idea');
  if (idea.author !== req.userId) return fail(res, 403, 'Only the author can add roles');

  const role = await TeamRole.create({ idea: idea.id, ...req.body });
  created(res, role, 'Open role added');
});

export const listOpenRoles = asyncHandler(async (req, res) => {
  const roles = await TeamRole.findAll({ where: { idea: req.params.id } });
  success(res, roles, 'Roles fetched');
});

export const updateOpenRole = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) return notFound(res, 'Idea');

  const role = await TeamRole.findOne({ where: { id: req.params.roleId, idea: idea.id } });
  if (!role) return notFound(res, 'Role');
  if (idea.author !== req.userId) return fail(res, 403, 'Only the author can update roles');

  await role.update(req.body);
  success(res, role, 'Role updated');
});

export const deleteOpenRole = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) return notFound(res, 'Idea');

  const role = await TeamRole.findOne({ where: { id: req.params.roleId, idea: idea.id } });
  if (!role) return notFound(res, 'Role');
  if (idea.author !== req.userId) return fail(res, 403, 'Only the author can remove roles');

  await role.destroy();
  success(res, null, 'Role removed');
});

// ===== Suggested collaborators =====

export const getSuggestedCollaborators = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) return notFound(res, 'Idea');

  const matches = await findCollaboratorsForIdea(idea, req.query.limit ? parseInt(req.query.limit) : 10);
  success(res, matches, 'Suggested collaborators');
});