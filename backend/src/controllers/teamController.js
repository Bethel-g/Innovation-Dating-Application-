import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import TeamRole from '../models/TeamRole.js';
import RoleApplication from '../models/RoleApplication.js';
import Idea from '../models/Idea.js';
import User from '../models/User.js';
import GroupMessage from '../models/GroupMessage.js';
import {
  acceptRoleApplication, declineRoleApplication, isTeamMember,
} from '../services/teamService.js';
import { dispatch } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail, notFound } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

const PROFILE_FIELDS = ['id', 'name', 'headline', 'role', 'photos', 'sector', 'isVerified', 'skills'];

export const applyToRole = asyncHandler(async (req, res) => {
  const role = await TeamRole.findByPk(req.params.roleId);
  if (!role) return notFound(res, 'Role');
  if (role.status !== 'open') return fail(res, 400, 'This role is no longer open');

  if (role.idea) {
    const idea = await Idea.findByPk(role.idea);
    if (idea && idea.author === req.userId) return fail(res, 400, 'You cannot apply to your own idea\'s role');
  }

  const [application, createdApp] = await RoleApplication.findOrCreate({
    where: { role: role.id, applicant: req.userId },
    defaults: {
      role: role.id,
      applicant: req.userId,
      message: req.body.message || '',
      highlights: req.body.highlights || [],
      status: 'pending',
    },
  });

  if (!createdApp) return fail(res, 400, 'You have already applied to this role');

  const idea = await Idea.findByPk(role.idea);
  if (idea) {
    const applicant = await User.findByPk(req.userId);
    await dispatch({
      user: idea.author,
      type: 'role_application',
      title: 'New role application',
      body: `${applicant.name} applied for the role "${role.title}" on "${idea.title}"`,
      data: { roleId: role.id, ideaId: idea.id, applicationId: application.id },
    });
  }

  created(res, application, 'Application submitted');
});

export const getRoleApplications = asyncHandler(async (req, res) => {
  const role = await TeamRole.findByPk(req.params.roleId);
  if (!role) return notFound(res, 'Role');

  const idea = await Idea.findByPk(role.idea);
  if (!idea) return notFound(res, 'Idea');
  if (idea.author !== req.userId) return fail(res, 403, 'Only the idea owner can view applications');

  const applications = await RoleApplication.findAll({
    where: { role: role.id },
    include: [{ model: User, as: 'applicantProfile', attributes: PROFILE_FIELDS }],
    order: [['createdAt', 'DESC']],
  });
  success(res, applications, 'Applications fetched');
});

export const respondToApplication = asyncHandler(async (req, res) => {
  const application = await RoleApplication.findByPk(req.params.id, {
    include: [{ model: TeamRole, as: 'roleDetail' }],
  });
  if (!application) return notFound(res, 'Application');

  const idea = application.roleDetail?.idea
    ? await Idea.findByPk(application.roleDetail.idea)
    : null;
  if (!idea) return fail(res, 400, 'Related idea not found');
  if (idea.author !== req.userId) return fail(res, 403, 'Only the idea owner can respond');

  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) return fail(res, 400, 'status must be accepted or declined');

  if (status === 'accepted') {
    const { team, application: accepted } = await acceptRoleApplication(application.id);
    return success(res, { team, application: accepted }, 'Application accepted, team formed');
  }

  const declined = await declineRoleApplication(application.id);
  success(res, declined, 'Application declined');
});

export const myTeams = asyncHandler(async (req, res) => {
  const memberships = await TeamMember.findAll({
    where: { user: req.userId },
    include: [
      { model: Team, as: 'teamDetail', include: [{ model: Idea, as: 'ideaDetail', attributes: ['id', 'title', 'sector', 'status'] }] },
    ],
  });
  success(res, memberships, 'My teams');
});

export const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findByPk(req.params.id, {
    include: [
      { model: Idea, as: 'ideaDetail' },
      { model: TeamMember, as: 'members', include: [{ model: User, as: 'profile', attributes: PROFILE_FIELDS }] },
    ],
  });
  if (!team) return notFound(res, 'Team');
  success(res, team, 'Team fetched');
});

export const sendTeamMessage = asyncHandler(async (req, res) => {
  const team = await Team.findByPk(req.params.id);
  if (!team) return notFound(res, 'Team');
  if (!await isTeamMember(team.id, req.userId)) return fail(res, 403, 'Only team members can message');

  const message = await GroupMessage.create({
    groupType: 'team',
    groupId: team.id,
    sender: req.userId,
    content: req.body.content,
    messageType: req.body.messageType || 'text',
    mediaUrl: req.body.mediaUrl || null,
  });

  const enriched = { ...message.toJSON(), senderProfile: await User.findByPk(req.userId, { attributes: ['id', 'name', 'photos'] }) };

  if (global.io) {
    global.io.to(`group:team:${team.id}`).emit('group_message', enriched);
  }

  created(res, enriched, 'Message sent');
});

export const getTeamMessages = asyncHandler(async (req, res) => {
  const team = await Team.findByPk(req.params.id);
  if (!team) return notFound(res, 'Team');
  if (!await isTeamMember(team.id, req.userId)) return fail(res, 403, 'Only team members can view messages');

  const { page, limit, offset } = parsePagination(req.query, { limit: 50 });

  const { count, rows } = await GroupMessage.findAndCountAll({
    where: { groupType: 'team', groupId: team.id },
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  const senderIds = [...new Set(rows.map(m => m.sender))];
  const senders = await User.findAll({ where: { id: senderIds }, attributes: ['id', 'name', 'photos'] });
  const senderMap = Object.fromEntries(senders.map(s => [s.id, s]));

  const enriched = rows.map(m => ({ ...m.toJSON(), senderProfile: senderMap[m.sender] || null }));
  success(res, enriched, 'Messages fetched', paginationMeta(page, limit, count));
});