import { Op } from 'sequelize';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import NotificationPreference from '../models/NotificationPreference.js';
import { NOTIFICATION_CHANNEL } from '../config/constants.js';

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
    const prefs = await NotificationPreference.findAll({
      where: { user: req.userId },
      order: [['eventType', 'ASC']],
    });

    const grouped = {};
    for (const pref of prefs) {
      if (!grouped[pref.eventType]) grouped[pref.eventType] = {};
      grouped[pref.eventType][pref.channel] = pref.enabled;
    }

    res.json({
      preferredChannels: Object.values(NOTIFICATION_CHANNEL),
      preferences: grouped,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];

    for (const { eventType, channel = NOTIFICATION_CHANNEL.IN_APP, enabled = true } of items) {
      if (!eventType) return res.status(400).json({ message: 'eventType is required' });
      await NotificationPreference.upsert({
        user: req.userId,
        channel,
        eventType,
        enabled,
      });
    }

    const prefs = await NotificationPreference.findAll({ where: { user: req.userId } });
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
