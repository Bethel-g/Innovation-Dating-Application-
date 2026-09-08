import { Op } from 'sequelize';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import { dispatch } from './notificationService.js';

export const getRelationship = async (userId, otherId) => {
  if (userId === otherId) return { status: 'self' };
  const c = await Connection.findOne({
    where: {
      [Op.or]: [
        { requester: userId, recipient: otherId },
        { requester: otherId, recipient: userId },
      ],
    },
  });
  if (!c) return { status: 'none' };
  const mine = c.requester === userId;
  return { status: c.status, connectionId: c.id, initiatedByMe: mine };
};

export const sendConnectionRequest = async ({ requester, recipient, ideaId = null, note = null }) => {
  if (requester === recipient) throw new Error('You cannot connect with yourself');

  const [existing] = await Connection.findOrCreate({
    where: { requester, recipient },
    defaults: { requester, recipient, ideaId, note, status: 'pending' },
  });

  if (existing.status === 'accepted') {
    return { connection: existing, already: true };
  }

  if (existing.status === 'pending') {
    return { connection: existing, already: true };
  }

  if (existing.status === 'rejected') {
    await existing.update({ status: 'pending', ideaId, note, respondedAt: null });
    return { connection: existing, already: false };
  }

  return { connection: existing, already: false };
};

export const respondToConnection = async (connectionId, recipientId, status) => {
  const connection = await Connection.findByPk(connectionId);
  if (!connection) throw new Error('Connection request not found');
  if (connection.recipient !== recipientId) throw new Error('Only the recipient can respond');

  await connection.update({ status, respondedAt: new Date() });

  if (status === 'accepted') {
    const [requester, recipient, idea] = await Promise.all([
      User.findByPk(connection.requester),
      User.findByPk(connection.recipient),
      connection.ideaId ? Idea.findByPk(connection.ideaId) : null,
    ]);
    await dispatch({
      user: connection.requester,
      type: 'connection_accepted',
      title: idea ? 'Interest accepted!' : 'Connection accepted!',
      body: idea
        ? `${recipient?.name} accepted your interest in "${idea.title}". You can now discuss your idea directly.`
        : `${recipient?.name} accepted your connection request.`,
      data: { connectionId: connection.id },
    });
  }

  return connection;
};

export const notifyConnectionRequest = async (connection) => {
  const requester = await User.findByPk(connection.requester);
  const idea = connection.ideaId ? await Idea.findByPk(connection.ideaId) : null;
  await dispatch({
    user: connection.recipient,
    type: 'connection_request',
    title: idea ? 'New interest in your idea' : 'New connection request',
    body: `${requester.name}${idea ? ` is interested in your idea "${idea.title}"` : ' sent you a connection request'}${
      connection.note ? `: ${connection.note}` : ''
    }`,
    data: { connectionId: connection.id, requesterId: connection.requester, ideaId: connection.ideaId },
  });
};