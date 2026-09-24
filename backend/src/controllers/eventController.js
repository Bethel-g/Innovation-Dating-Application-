import { Op } from 'sequelize';
import Event from '../models/Event.js';
import EventRegistration from '../models/EventRegistration.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

const shapeEvent = (event, { isRegistered = false } = {}) => ({
  ...event.toJSON(),
  isRegistered: !!isRegistered,
  spotsLeft: event.maxAttendees ? Math.max(0, event.maxAttendees - event.attendees) : null,
});

export const listEvents = async (req, res) => {
  try {
    const { type = 'all', q = '' } = req.query;

    const where = {};
    if (type && type !== 'all') where.type = type;
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const events = await Event.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    const regs = await EventRegistration.findAll({ where: { user: req.userId } });
    const regSet = new Set(regs.map(r => r.event));

    const orgIds = [...new Set(events.map(e => e.organizer))];
    const organizers = await User.findAll({ where: { id: orgIds }, attributes: ['id', 'name', 'headline'] });
    const orgMap = Object.fromEntries(organizers.map(o => [o.id, o.name]));

    res.json(events.map(e => ({
      ...shapeEvent(e, { isRegistered: regSet.has(e.id) }),
      organizer: orgMap[e.organizer] || null,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isRegistered = Boolean(await EventRegistration.findOne({ where: { user: req.userId, event: event.id } }));
    const organizer = await User.findByPk(event.organizer, { attributes: ['id', 'name', 'photos', 'headline'] });

    res.json({ ...shapeEvent(event, { isRegistered }), organizerProfile: organizer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      title, type, description, date, time, location, isOnline,
      isFree, price, maxAttendees, tags, speakers, isFeatured,
    } = req.body;

    if (!title) return res.status(400).json({ message: 'Event title is required' });

    const event = await Event.create({
      organizer: req.userId,
      title,
      type,
      description,
      date,
      time,
      location,
      isOnline: isOnline === true || isOnline === 'true',
      isFree: isFree === true || isFree === 'true' || isFree === undefined,
      price,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
      attendees: 0,
      speakers: Array.isArray(speakers) ? speakers : [],
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: !!isFeatured,
    });

    res.status(201).json({ message: 'Event created successfully', event: shapeEvent(event) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer !== req.userId) return res.status(403).json({ message: 'Only the organizer can update this event' });

    await event.update(req.body);
    res.json({ message: 'Event updated', event: shapeEvent(event) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer !== req.userId && !['admin', 'moderator', 'support'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not allowed to delete this event' });
    }
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleRegister = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer === req.userId) {
      return res.status(400).json({ message: 'You are hosting this event' });
    }

    const existing = await EventRegistration.findOne({ where: { user: req.userId, event: event.id } });

    if (existing) {
      await existing.destroy();
      await Event.decrement('attendees', { by: 1, where: { id: event.id, attendees: { [Op.gt]: 0 } } });
      return res.json({ registered: false, attendees: Math.max(0, event.attendees - 1), message: 'Unregistered from event' });
    }

    if (event.maxAttendees && event.attendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    await EventRegistration.create({ user: req.userId, event: event.id });
    await Event.increment('attendees', { by: 1, where: { id: event.id } });

    await createNotification({
      user: event.organizer,
      type: 'event_registration',
      title: 'New event registration',
      body: `${req.user.name} registered for "${event.title}"`,
      data: { eventId: event.id },
    });

    res.json({ registered: true, attendees: event.attendees + 1, message: 'Registered for event' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const regs = await EventRegistration.findAll({
      where: { user: req.userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: Event, as: 'eventDetail' }],
    });

    res.json(regs.filter(r => r.eventDetail).map(r => shapeEvent(r.eventDetail, { isRegistered: true })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};