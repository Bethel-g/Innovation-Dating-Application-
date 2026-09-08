import User from './User.js';
import Idea from './Idea.js';
import Post from './Post.js';
import Project from './Project.js';
import Notification from './Notification.js';
import Organization from './Organization.js';
import Opportunity from './Opportunity.js';
import OpportunityApplication from './OpportunityApplication.js';
import TeamRole from './TeamRole.js';
import RoleApplication from './RoleApplication.js';
import Team from './Team.js';
import TeamMember from './TeamMember.js';
import Connection from './Connection.js';
import VerificationRequest from './VerificationRequest.js';
import Bookmark from './Bookmark.js';
import NotificationPreference from './NotificationPreference.js';

// ===== Identity & Profiles =====
User.hasMany(Idea, { foreignKey: 'author', as: 'ideas' });
Idea.belongsTo(User, { foreignKey: 'author', as: 'authorDetail' });

User.hasMany(Post, { foreignKey: 'author', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'author', as: 'authorDetail' });

User.hasMany(Project, { foreignKey: 'author', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'author', as: 'authorDetail' });

User.hasMany(Notification, { foreignKey: 'user', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user', as: 'profile' });

// ===== Organizations =====
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Organization.hasMany(User, { foreignKey: 'organizationId', as: 'members' });
Organization.belongsTo(User, { foreignKey: 'owner', as: 'ownerProfile' });

// ===== Opportunities =====
Organization.hasMany(Opportunity, { foreignKey: 'organization', as: 'opportunities' });
Opportunity.belongsTo(Organization, { foreignKey: 'organization', as: 'organizationDetail' });

Opportunity.hasMany(OpportunityApplication, { foreignKey: 'opportunity', as: 'applications' });
OpportunityApplication.belongsTo(Opportunity, { foreignKey: 'opportunity', as: 'opportunityDetail' });
OpportunityApplication.belongsTo(User, { foreignKey: 'applicantUser', as: 'applicantProfile' });

// ===== Ideas -> Team formation =====
Idea.hasMany(TeamRole, { foreignKey: 'idea', as: 'openRoles' });
TeamRole.belongsTo(Idea, { foreignKey: 'idea', as: 'ideaDetail' });

TeamRole.hasMany(RoleApplication, { foreignKey: 'role', as: 'applications' });
RoleApplication.belongsTo(TeamRole, { foreignKey: 'role', as: 'roleDetail' });
RoleApplication.belongsTo(User, { foreignKey: 'applicant', as: 'applicantProfile' });

Idea.hasOne(Team, { foreignKey: 'idea', as: 'team' });
Team.belongsTo(Idea, { foreignKey: 'idea', as: 'ideaDetail' });

Team.hasMany(TeamMember, { foreignKey: 'team', as: 'members' });
TeamMember.belongsTo(Team, { foreignKey: 'team', as: 'teamDetail' });
TeamMember.belongsTo(User, { foreignKey: 'user', as: 'profile' });

// ===== Connections =====
Connection.belongsTo(User, { foreignKey: 'requester', as: 'requesterProfile' });
Connection.belongsTo(User, { foreignKey: 'recipient', as: 'recipientProfile' });
Connection.belongsTo(Idea, { foreignKey: 'ideaId', as: 'ideaDetail' });

// ===== Verification =====
VerificationRequest.belongsTo(User, { foreignKey: 'userId', as: 'submitter' });
VerificationRequest.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organizationDetail' });

// ===== Bookmarks & preferences =====
Bookmark.belongsTo(User, { foreignKey: 'user', as: 'owner' });
NotificationPreference.belongsTo(User, { foreignKey: 'user', as: 'owner' });

export {
  User, Idea, Post, Project, Notification,
  Organization, Opportunity, OpportunityApplication,
  TeamRole, RoleApplication, Team, TeamMember,
  Connection, VerificationRequest, Bookmark, NotificationPreference,
};