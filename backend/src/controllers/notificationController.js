import { Op } from 'sequelize';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const where = { user: req.userId };
    if (type) where.type = type;

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const total = await Notification.count({ where });
    const unreadCount = await Notification.count({ where: { user: req.userId, isRead: false } });

    res.json({
      notifications,
      unreadCount,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, user: req.userId },
    });

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { user: req.userId, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.destroy({ where: { id: req.params.id, user: req.userId } });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({ where: { user: req.userId, isRead: false } });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, { attributes: ['notificationPreferences'] });
    res.json(user.notificationPreferences || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    await User.update(
      { notificationPreferences: req.body },
      { where: { id: req.userId } }
    );
    const user = await User.findByPk(req.userId, { attributes: ['notificationPreferences'] });
    res.json(user.notificationPreferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
