import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import Idea from '../models/Idea.js';
import TeamRole from '../models/TeamRole.js';
import RoleApplication from '../models/RoleApplication.js';
import { dispatch } from './notificationService.js';

export const getOrCreateTeamForIdea = async (ideaId, name = null) => {
  let team = await Team.findOne({ where: { idea: ideaId } });
  if (!team) {
    const idea = await Idea.findByPk(ideaId);
    team = await Team.create({ idea: ideaId, name: name || idea?.title || 'Team' });
  }
  return team;
};

export const addMember = async ({ teamId, userId, role = null, notify = false, viaApplication = null }) => {
  const [member, created] = await TeamMember.findOrCreate({
    where: { team: teamId, user: userId },
    defaults: { team: teamId, user: userId, role, joinedAt: new Date() },
  });

  if (created && role && !member.role) await member.update({ role });

  if (notify && viaApplication) {
    const idea = await Idea.findByPk(viaApplication.ideaId);
    await dispatch({
      user: userId,
      type: 'role_application_accepted',
      title: 'You joined a team!',
      body: `You have been accepted to the team working on "${idea?.title || 'your role'}"`,
      data: { teamId, ideaId: viaApplication.ideaId },
    });
  }

  return member;
};

export const acceptRoleApplication = async (applicationId) => {
  const application = await RoleApplication.findByPk(applicationId, {
    include: [{ model: TeamRole, as: 'roleDetail' }],
  });

  if (!application) throw new Error('Application not found');
  const { roleDetail } = application;

  const idea = await Idea.findByPk(roleDetail.idea);
  if (!idea) throw new Error('Idea not found');

  await application.update({ status: 'accepted' });
  await roleDetail.update({ status: 'filled' });

  if (idea.status === 'open') await idea.update({ status: 'in_discussion' });

  const team = await getOrCreateTeamForIdea(roleDetail.idea);
  await addMember({ teamId: team.id, userId: idea.author, role: 'Project Lead' });
  await addMember({
    teamId: team.id,
    userId: application.applicant,
    role: roleDetail.title,
    notify: true,
    viaApplication: { ideaId: idea.id },
  });

  return { team, application };
};

export const declineRoleApplication = async (applicationId) => {
  const application = await RoleApplication.findByPk(applicationId);
  if (!application) throw new Error('Application not found');
  await application.update({ status: 'declined' });

  await dispatch({
    user: application.applicant,
    type: 'role_application_declined',
    title: 'Application update',
    body: 'Your application for a role was declined.',
    data: { applicationId: application.id },
  });

  return application;
};

export const isTeamMember = async (teamId, userId) => {
  return Boolean(await TeamMember.findOne({ where: { team: teamId, user: userId } }));
};