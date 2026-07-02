import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const connectedUsers = new Map();

export const setupSocket = (io) => {
  global.io = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) return next(new Error('User not found'));

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);

    await User.update({ isOnline: true, lastActive: new Date() }, { where: { id: userId } });
    io.emit('user_online', { userId });

    socket.on('join_match', (matchId) => socket.join(`match:${matchId}`));
    socket.on('leave_match', (matchId) => socket.leave(`match:${matchId}`));

    socket.on('typing', ({ matchId, isTyping }) => {
      socket.to(`match:${matchId}`).emit('user_typing', { userId, matchId, isTyping });
    });

    socket.on('message_read', ({ matchId, messageId }) => {
      socket.to(`match:${matchId}`).emit('message_read', { userId, matchId, messageId });
    });

    socket.on('call_user', ({ targetUserId, offer }) => {
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming_call', { from: userId, fromUser: socket.user, offer });
      }
    });

    socket.on('call_answer', ({ targetUserId, answer }) => {
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call_answered', { from: userId, answer });
      }
    });

    socket.on('ice_candidate', ({ targetUserId, candidate }) => {
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice_candidate', { from: userId, candidate });
      }
    });

    socket.on('end_call', ({ targetUserId }) => {
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) io.to(targetSocketId).emit('call_ended', { from: userId });
    });

    socket.on('location_update', async ({ latitude, longitude }) => {
      await User.update(
        { locationLat: latitude, locationLng: longitude },
        { where: { id: userId } }
      );
    });

    socket.on('disconnect', async () => {
      connectedUsers.delete(userId);
      await User.update({ isOnline: false, lastActive: new Date() }, { where: { id: userId } });
      io.emit('user_offline', { userId });
    });
  });

  return io;
};

export const getConnectedUsers = () => connectedUsers;
export const isUserOnline = (userId) => connectedUsers.has(userId.toString());
