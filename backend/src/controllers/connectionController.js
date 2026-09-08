import { Op } from 'sequelize';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import {
  getRelationship,
  sendConnectionRequest,
  respondToConnection,
  notifyConnectionRequest,
} from '../services/connectionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, fail, notFound } from '../utils/apiResponse.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

const PROFILE_FIELDS = ['id', 'name', 'headline', 'role', 'photos', 'sector', 'isVerified', 'locationCity', 'locationCountry', 'skills'];

export const sendRequest = asyncHandler(async (req, res) => {
  const { recipient, ideaId, note } = req.body;

  const target = recipient || (ideaId ? (await Idea.findByPk(ideaId))?.author : null);
  if (!target) return fail(res, 400, 'Provide a recipient userId or an ideaId');

  const { connection, already } = await sendConnectionRequest({
    requester: req.userId,
    recipient: target,
    ideaId: ideaId || null,
    note: note || null,
  });

  if (!already) await notifyConnectionRequest(connection);
  success(res, { connectionId: connection.id, status: connection.status }, already
    ? 'Request already exists'
    : 'Connection request sent');
});

export const listConnections = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { status } = req.query;

  const where = { [Op.or]: [{ requester: req.userId }, { recipient: req.userId }] };
  if (status) where.status = status;

  const { count, rows } = await Connection.findAndCountAll({
    where,
    include: [
      { model: User, as: 'requesterProfile', attributes: PROFILE_FIELDS },
      { model: User, as: 'recipientProfile', attributes: PROFILE_FIELDS },
      { model: Idea, as: 'ideaDetail', attributes: ['id', 'title', 'sector'] },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  const enriched = rows.filter(c => c.status === 'accepted').map(c => {
    const other = c.requester === req.userId ? c.recipientProfile : c.requesterProfile;
    return { ...c.toJSON(), other };
  });

  success(res, enriched, 'Connections fetched', paginationMeta(page, limit, count));
});

export const incomingRequests = asyncHandler(async (req, res) => {
  const requests = await Connection.findAll({
    where: { recipient: req.userId, status: 'pending' },
    include: [
      { model: User, as: 'requesterProfile', attributes: PROFILE_FIELDS },
      { model: Idea, as: 'ideaDetail', attributes: ['id', 'title', 'sector'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  success(res, requests, 'Incoming requests fetched');
});

export const sentRequests = asyncHandler(async (req, res) => {
  const requests = await Connection.findAll({
    where: { requester: req.userId, status: 'pending' },
    include: [
      { model: User, as: 'recipientProfile', attributes: PROFILE_FIELDS },
      { model: Idea, as: 'ideaDetail', attributes: ['id', 'title', 'sector'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  success(res, requests, 'Sent requests fetched');
});

export const respond = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) return fail(res, 400, 'status must be accepted or declined');

  const connection = await respondToConnection(req.params.id, req.userId, status);
  success(res, connection, `Request ${status}`);
});

export const withdraw = asyncHandler(async (req, res) => {
  const connection = await Connection.findByPk(req.params.id);
  if (!connection) return notFound(res, 'Connection request');
  if (connection.requester !== req.userId) return fail(res, 403, 'Only the requester can withdraw');

  await connection.update({ status: 'withdrawn' });
  success(res, null, 'Request withdrawn');
});

export const relationshipStatus = asyncHandler(async (req, res) => {
  const rel = await getRelationship(req.userId, req.params.userId);
  success(res, rel, 'Relationship status');
});

export const ideaInterests = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.ideaId);
  if (!idea) return notFound(res, 'Idea');
  if (idea.author !== req.userId) return fail(res, 403, 'Only the author can view interest');

  const interests = await Connection.findAll({
    where: { ideaId: idea.id },
    include: [{ model: User, as: 'requesterProfile', attributes: PROFILE_FIELDS }],
    order: [['createdAt', 'DESC']],
  });
  success(res, interests, 'Interest fetched');
});