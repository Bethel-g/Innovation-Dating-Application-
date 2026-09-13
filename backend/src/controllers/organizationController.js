import { Op } from 'sequelize';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import VerificationRequest from '../models/VerificationRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { jsonbContains } from '../utils/jsonContains.js';
import { success, created, fail, notFound } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

const OWNER_ROLES = ['ecosystem_builder', 'company', 'investor'];

export const createOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.create({ ...req.body, owner: req.userId });
  await User.update({ organizationId: org.id, role: req.user.role === 'user' ? 'ecosystem_builder' : req.user.role }, { where: { id: req.userId } });
  created(res, org, 'Organization created');
});

export const listOrganizations = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { type, sector, q = '' } = req.query;

  const where = {};
  if (type) where.type = type;
  if (sector) where.sectors = jsonbContains('sectors', sector);
  if (q) where.name = { [Op.iLike]: `%${q}%` };

  const { count, rows } = await Organization.findAndCountAll({
    where,
    include: [
      { model: User, as: 'ownerProfile', attributes: ['id', 'name', 'photos'] },
      { model: User, as: 'members', attributes: ['id', 'name', 'role', 'photos', 'sector'] },
    ],
    order: [['verified', 'DESC'], ['createdAt', 'DESC']],
    offset,
    limit,
  });

  success(res, rows, 'Organizations fetched', paginationMeta(page, limit, count));
});

export const getOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findByPk(req.params.id, {
    include: [
      { model: User, as: 'ownerProfile', attributes: ['id', 'name', 'photos', 'headline'] },
      { model: User, as: 'members', attributes: ['id', 'name', 'role', 'photos', 'sector', 'headline'] },
      { model: Opportunity, as: 'opportunities', where: { status: { [Op.ne]: 'draft' } }, required: false, limit: 20 },
    ],
  });
  if (!org) return notFound(res, 'Organization');
  success(res, org, 'Organization fetched');
});

export const updateOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findByPk(req.params.id);
  if (!org) return notFound(res, 'Organization');
  if (org.owner !== req.userId) return fail(res, 403, 'Only the organization owner can update');

  await org.update(req.body);
  success(res, org, 'Organization updated');
});

export const addMember = asyncHandler(async (req, res) => {
  const org = await Organization.findByPk(req.params.id);
  if (!org) return notFound(res, 'Organization');
  if (org.owner !== req.userId) return fail(res, 403, 'Only the organization owner can add members');

  const { userId } = req.body;
  await User.update({ organizationId: org.id }, { where: { id: userId } });
  success(res, null, 'Member added to organization');
});

export const removeMember = asyncHandler(async (req, res) => {
  const org = await Organization.findByPk(req.params.id);
  if (!org) return notFound(res, 'Organization');
  if (org.owner !== req.userId) return fail(res, 403, 'Only the organization owner can remove members');
  if (req.params.userId === org.owner) return fail(res, 400, 'Cannot remove the owner');

  await User.update({ organizationId: null }, { where: { id: req.params.userId } });
  success(res, null, 'Member removed from organization');
});

export const submitVerification = asyncHandler(async (req, res) => {
  const org = await Organization.findByPk(req.params.id);
  if (!org) return notFound(res, 'Organization');
  if (org.owner !== req.userId) return fail(res, 403, 'Only the organization owner can submit for verification');

  const [request, createdReq] = await VerificationRequest.findOrCreate({
    where: { organizationId: org.id, status: 'pending' },
    defaults: {
      organizationId: org.id,
      requestType: 'organization',
      documents: req.body.documents || [],
      verificationNote: req.body.verificationNote || '',
      status: 'pending',
    },
  });

  if (!createdReq) return fail(res, 400, 'A verification request is already pending');

  created(res, request, 'Verification submitted');
});

