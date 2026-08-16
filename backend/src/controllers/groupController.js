import { Op } from 'sequelize';
import GroupMessage from '../models/GroupMessage.js';
import ActivityLog from '../models/ActivityLog.js';
import SharedFile from '../models/SharedFile.js';
import ProjectMember from '../models/ProjectMember.js';
import CommunityMember from '../models/CommunityMember.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupType, groupId } = req.params;

    const isMember = groupType === 'project'
      ? await ProjectMember.findOne({ where: { project: groupId, user: req.userId, status: 'approved' } })
      : await CommunityMember.findOne({ where: { community: groupId, user: req.userId, status: 'approved' } });

    if (!isMember) return res.status(403).json({ message: 'Not a member' });

    const message = await GroupMessage.create({
      groupType,
      groupId,
      sender: req.userId,
      content: req.body.content,
      messageType: req.body.messageType || 'text',
      mediaUrl: req.body.mediaUrl,
    });

    const sender = await User.findByPk(req.userId, { attributes: ['id', 'name', 'photos'] });

    res.status(201).json({ ...message.toJSON(), sender });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupType, groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await GroupMessage.findAll({
      where: { groupType, groupId },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const senderIds = [...new Set(messages.map(m => m.sender))];
    const senders = senderIds.length > 0
      ? await User.findAll({ where: { id: senderIds }, attributes: ['id', 'name', 'photos'] })
      : [];
    const senderMap = Object.fromEntries(senders.map(s => [s.id, s.toJSON()]));

    const enriched = messages.map(m => ({
      ...m.toJSON(),
      sender: senderMap[m.sender] || { id: m.sender },
    }));

    res.json(enriched.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivityLog = async (req, res) => {
  try {
    const { groupType, groupId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const logs = await ActivityLog.findAll({
      where: { groupType, groupId },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const userIds = [...new Set(logs.map(l => l.user))];
    const users = userIds.length > 0
      ? await User.findAll({ where: { id: userIds }, attributes: ['id', 'name', 'photos'] })
      : [];
    const userMap = Object.fromEntries(users.map(u => [u.id, u.toJSON()]));

    const enriched = logs.map(l => ({
      ...l.toJSON(),
      user: userMap[l.user] || { id: l.user },
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const { groupType, groupId } = req.params;

    const isMember = groupType === 'project'
      ? await ProjectMember.findOne({ where: { project: groupId, user: req.userId, status: 'approved' } })
      : await CommunityMember.findOne({ where: { community: groupId, user: req.userId, status: 'approved' } });

    if (!isMember) return res.status(403).json({ message: 'Not a member' });

    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const file = await SharedFile.create({
      groupType,
      groupId,
      uploadedBy: req.userId,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      description: req.body.description,
    });

    await ActivityLog.create({
      groupType,
      groupId,
      user: req.userId,
      action: 'file_uploaded',
      details: { fileId: file.id, fileName: file.fileName },
    });

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const { groupType, groupId } = req.params;

    const files = await SharedFile.findAll({
      where: { groupType, groupId },
      order: [['createdAt', 'DESC']],
    });

    const uploaderIds = [...new Set(files.map(f => f.uploadedBy))];
    const uploaders = uploaderIds.length > 0
      ? await User.findAll({ where: { id: uploaderIds }, attributes: ['id', 'name', 'photos'] })
      : [];
    const uploaderMap = Object.fromEntries(uploaders.map(u => [u.id, u.toJSON()]));

    const enriched = files.map(f => ({
      ...f.toJSON(),
      uploader: uploaderMap[f.uploadedBy] || { id: f.uploadedBy },
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await SharedFile.findByPk(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (file.uploadedBy !== req.userId) {
      return res.status(403).json({ message: 'Only the uploader can delete' });
    }

    await file.destroy();
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
