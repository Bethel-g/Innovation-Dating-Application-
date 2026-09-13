import { Op } from 'sequelize';
import Opportunity from '../models/Opportunity.js';
import OpportunityApplication from '../models/OpportunityApplication.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import { dispatch } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail, notFound } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { jsonbContains } from '../utils/jsonContains.js';
import { OPPORTUNITY_TYPE, OPPORTUNITY_STATUS, USER_ROLES } from '../config/constants.js';

const PROFILE_FIELDS = ['id', 'name', 'headline', 'role', 'photos', 'sector', 'isVerified'];

async function getManagedOrganization(req) {
  const org = await Organization.findOne({ where: { id: req.user.organizationId } });
  if (!org) return null;
  const canManage = org.owner === req.userId || req.user.organizationId === org.id;
  return canManage ? org : null;
}

export const autoCloseExpired = async () => {
  const affected = await Opportunity.update(
    { status: OPPORTUNITY_STATUS.CLOSED },
    {
      where: {
        status: { [Op.in]: [OPPORTUNITY_STATUS.OPEN, OPPORTUNITY_STATUS.CLOSING_SOON] },
        deadline: { [Op.lt]: new Date() },
      },
    }
  );
  if (affected[0]) console.log(`Auto-closed ${affected[0]} expired opportunity(ies)`);
};

export const createOpportunity = asyncHandler(async (req, res) => {
  const org = await getManagedOrganization(req);
  if (!org) return fail(res, 403, 'Only members/managers of an organization can post opportunities');

  const { deadline } = req.body;
  const opportunity = await Opportunity.create({
    ...req.body,
    organization: org.id,
    status: req.body.status === OPPORTUNITY_STATUS.DRAFT ? OPPORTUNITY_STATUS.DRAFT : OPPORTUNITY_STATUS.OPEN,
    deadline: deadline ? new Date(deadline) : null,
  });

  created(res, opportunity, 'Opportunity created');
});

export const listOpportunities = asyncHandler(async (req, res) => {
  await autoCloseExpired();
  const { page, limit, offset } = parsePagination(req.query);
  const { type, status, sector, skill, q = '', mine } = req.query;

  const where = {};
  if (type) where.type = type;
  if (status) where.status = status;
  else where.status = { [Op.ne]: OPPORTUNITY_STATUS.DRAFT };
  if (sector) where.sectors = jsonbContains('sectors', sector);
  if (skill) where.skillsNeeded = jsonbContains('skillsNeeded', skill);
  if (mine === 'true') {
    const org = await getManagedOrganization(req);
    if (!org) return success(res, [], 'No opportunities', paginationMeta(page, limit, 0));
    where.organization = org.id;
  }
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const { count, rows } = await Opportunity.findAndCountAll({
    where,
    include: [{ model: Organization, as: 'organizationDetail', attributes: ['id', 'name', 'type', 'verified', 'photos'] }],
    order: [['deadline', 'ASC']],
    offset,
    limit,
  });

  success(res, rows, 'Opportunities fetched', paginationMeta(page, limit, count));
});

export const getOpportunity = asyncHandler(async (req, res) => {
  await autoCloseExpired();

  const opportunity = await Opportunity.findByPk(req.params.id, {
    include: [
      { model: Organization, as: 'organizationDetail' },
      {
        model: OpportunityApplication, as: 'applications',
        where: { applicantUser: req.userId }, required: false, limit: 1,
      },
    ],
  });
  if (!opportunity) return notFound(res, 'Opportunity');

  await opportunity.update({ viewCount: (opportunity.viewCount || 0) + 1 });

  const data = opportunity.toJSON();
  data.myApplication = data.applications?.[0] || null;
  delete data.applications;

  success(res, data, 'Opportunity fetched');
});

export const updateOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findByPk(req.params.id);
  if (!opportunity) return notFound(res, 'Opportunity');

  const org = await getManagedOrganization(req);
  if (!org || org.id !== opportunity.organization) return fail(res, 403, 'Only the managing organization can update');

  const updates = { ...req.body };
  if (updates.deadline) updates.deadline = new Date(updates.deadline);
  await opportunity.update(updates);
  success(res, opportunity, 'Opportunity updated');
});

export const updateOpportunityStatus = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findByPk(req.params.id);
  if (!opportunity) return notFound(res, 'Opportunity');

  const org = await getManagedOrganization(req);
  if (!org || org.id !== opportunity.organization) return fail(res, 403, 'Only the managing organization can update status');

  const { status } = req.body;
  if (!Object.values(OPPORTUNITY_STATUS).includes(status)) return fail(res, 400, 'Invalid status');

  await opportunity.update({ status });
  success(res, opportunity, 'Opportunity status updated');
});

export const deleteOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findByPk(req.params.id);
  if (!opportunity) return notFound(res, 'Opportunity');

  const org = await getManagedOrganization(req);
  if (!org || org.id !== opportunity.organization) return fail(res, 403, 'Only the managing organization can delete');

  await opportunity.destroy();
  success(res, null, 'Opportunity deleted');
});

export const applyToOpportunity = asyncHandler(async (req, res) => {
  await autoCloseExpired();
  const opportunity = await Opportunity.findByPk(req.params.id);
  if (!opportunity) return notFound(res, 'Opportunity');
  if (opportunity.status === OPPORTUNITY_STATUS.CLOSED) return fail(res, 400, 'This opportunity has closed');

  const { message, ideaId } = req.body;
  if (ideaId) {
    const idea = await Idea.findByPk(ideaId);
    if (!idea) return fail(res, 400, 'Idea not found');
  }

  const [application, isNew] = await OpportunityApplication.findOrCreate({
    where: { opportunity: opportunity.id, applicantUser: req.userId },
    defaults: {
      opportunity: opportunity.id,
      applicantUser: req.userId,
      applicantType: ideaId ? 'idea' : 'user',
      applicantIdea: ideaId || null,
      message: message || '',
      status: 'pending',
    },
  });

  if (!isNew) return fail(res, 400, 'You have already applied to this opportunity');

  await opportunity.update({ applicationCount: opportunity.applicationCount + 1 });

  const org = await Organization.findByPk(opportunity.organization, { include: [{ model: User, as: 'ownerProfile' }] });
  if (org?.owner) {
    const applicant = await User.findByPk(req.userId);
    await dispatch({
      user: org.owner,
      type: 'opportunity_application',
      title: 'New opportunity application',
      body: `${applicant.name} applied to "${opportunity.title}"`,
      data: { opportunityId: opportunity.id, applicationId: application.id },
    });
  }

  created(res, application, 'Application submitted');
});

export const listApplications = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findByPk(req.params.id);
  if (!opportunity) return notFound(res, 'Opportunity');

  const org = await getManagedOrganization(req);
  if (!org || org.id !== opportunity.organization) return fail(res, 403, 'Only the managing organization can view applications');

  const { page, limit, offset } = parsePagination(req.query, { limit: 50 });
  const { status } = req.query;

  const where = { opportunity: opportunity.id };
  if (status) where.status = status;

  const { count, rows } = await OpportunityApplication.findAndCountAll({
    where,
    include: [
      { model: User, as: 'applicantProfile', attributes: PROFILE_FIELDS },
      { model: Opportunity, as: 'opportunityDetail' },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  success(res, rows, 'Applications fetched', paginationMeta(page, limit, count));
});

export const respondToApplication = asyncHandler(async (req, res) => {
  const application = await OpportunityApplication.findByPk(req.params.id, {
    include: [{ model: Opportunity, as: 'opportunityDetail' }],
  });
  if (!application) return notFound(res, 'Application');

  const opportunity = application.opportunityDetail;
  const org = await getManagedOrganization(req);
  if (!org || org.id !== opportunity.organization) return fail(res, 403, 'Only the managing organization can respond');

  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) return fail(res, 400, 'status must be accepted or declined');

  await application.update({ status });
  await dispatch({
    user: application.applicantUser,
    type: status === 'accepted' ? 'opportunity_application_accepted' : 'role_application_declined',
    title: status === 'accepted' ? 'Application accepted!' : 'Application update',
    body: status === 'accepted'
      ? `Your application to "${opportunity.title}" was accepted.`
      : `Your application to "${opportunity.title}" was declined.`,
    data: { opportunityId: opportunity.id, applicationId: application.id },
  });

  success(res, application, `Application ${status}`);
});

export const myOpportunityApplications = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query, { limit: 50 });

  const { count, rows } = await OpportunityApplication.findAndCountAll({
    where: { applicantUser: req.userId },
    include: [
      {
        model: Opportunity, as: 'opportunityDetail',
        include: [{ model: Organization, as: 'organizationDetail', attributes: ['id', 'name', 'type', 'photos'] }],
      },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  success(res, rows, 'My applications', paginationMeta(page, limit, count));
});