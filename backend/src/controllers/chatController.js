import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import Message from '../models/Message.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import { generateIcebreakerPrompt } from '../services/aiService.js';
import { jsonbContains } from '../utils/jsonContains.js';
import { moderateContent } from '../services/moderationService.js';

export const sendMessage = async (req, res) => {
  try {
    const { matchId, content, messageType = 'text', icebreakerPrompt } = req.body;

    const match = await Match.findByPk(matchId);
    if (!match || match.status !== 'matched') {
      return res.status(400).json({ message: 'Invalid match' });
    }

    const moderation = moderateContent(content);
    const message = await Message.create({
      match: matchId,
      sender: req.userId,
      content,
      messageType,
      icebreakerPrompt,
      isFlagged: !moderation.isClean,
      flagReason: moderation.isClean ? null : moderation.flags[0]?.type,
    });

    const sender = await User.findByPk(req.userId, { attributes: ['id', 'name', 'photos'] });
    const msgWithSender = { ...message.toJSON(), sender: sender.toJSON() };

    global.io?.to(`match:${matchId}`).emit('new_message', msgWithSender);

    const receiverId = match.users.find(u => u !== req.userId);
    global.io?.to(`user:${receiverId}`).emit('notification', {
      type: 'new_message',
      title: `New message from ${sender.name}`,
      body: content.substring(0, 100),
      data: { matchId, senderId: req.userId },
    });

    res.json(msgWithSender);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const match = await Match.findOne({
      where: { [Op.and]: [{ id: matchId }, jsonbContains('users', req.userId)] },
    });

    if (!match) return res.status(404).json({ message: 'Match not found' });

    const messages = await Message.findAll({
      where: { match: matchId },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const total = await Message.count({ where: { match: matchId } });

    const senders = await User.findAll({
      where: { id: [...new Set(messages.map(m => m.sender))] },
      attributes: ['id', 'name', 'photos'],
    });
    const senderMap = Object.fromEntries(senders.map(s => [s.id, s.toJSON()]));

    await Message.update(
      { isRead: true, readAt: new Date() },
      { where: { match: matchId, sender: { [Op.ne]: req.userId }, isRead: false } }
    );

    const enriched = messages.reverse().map(m => ({
      ...m.toJSON(),
      sender: senderMap[m.sender] || { id: m.sender },
    }));

    res.json({
      messages: enriched,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const matches = await Match.findAll({
      where: { [Op.and]: [jsonbContains('users', req.userId), { status: 'matched' }] },
    });

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const lastMessage = await Message.findOne({
          where: { match: match.id },
          order: [['createdAt', 'DESC']],
        });

        const unreadCount = await Message.count({
          where: { match: match.id, sender: { [Op.ne]: req.userId }, isRead: false },
        });

        const otherUserId = match.users.find(u => u !== req.userId);
        const otherUser = otherUserId ? await User.findByPk(otherUserId) : null;

        return {
          match,
          otherUser,
          lastMessage,
          unreadCount,
        };
      })
    );

    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIcebreakerPrompt = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const otherUserId = match.users.find(u => u !== req.userId);
    const currentUser = await User.findByPk(req.userId);
    const otherUser = otherUserId ? await User.findByPk(otherUserId) : null;

    const prompt = generateIcebreakerPrompt(currentUser, otherUser);
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findOne({
      where: { id: messageId, sender: req.userId },
    });

    if (!message) return res.status(404).json({ message: 'Message not found' });

    await message.destroy();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { matchId } = req.params;
    await Message.update(
      { isRead: true, readAt: new Date() },
      { where: { match: matchId, sender: { [Op.ne]: req.userId }, isRead: false } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
