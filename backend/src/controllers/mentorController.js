import { Op } from 'sequelize';
import User from '../models/User.js';
import Review from '../models/Review.js';
import MentorshipSession from '../models/MentorshipSession.js';
import { createNotification } from '../services/notificationService.js';

const MENTOR_ATTRS = [
  'id', 'name', 'headline', 'role', 'photos', 'bio', 'skills', 'primarySkills',
  'locationCity', 'locationCountry', 'isVerified', 'yearsOfExperience', 'isMentor',
  'mentorExpertise', 'mentorAvailability', 'mentorshipCount', 'reputationScore',
  'endorsementCount', 'githubUrl', 'linkedinUrl', 'websiteUrl',
];

const enrichMentors = async (mentors) => {
  const ids = mentors.map(m => m.id);
  const reviews = await Review.findAll({
    where: { reviewed: { [Op.in]: ids } },
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'reviewerProfile', attributes: ['id', 'name', 'photos'] }],
  });

  const reviewsByMentor = {};
  for (const review of reviews) {
    if (!reviewsByMentor[review.reviewed]) reviewsByMentor[review.reviewed] = [];
    reviewsByMentor[review.reviewed].push({
      id: review.id,
      rating: review.rating,
      text: review.comment || '',
      createdAt: review.createdAt,
      user: review.reviewerProfile
        ? { id: review.reviewerProfile.id, name: review.reviewerProfile.name, photos: review.reviewerProfile.photos }
        : null,
    });
  }

  return mentors.map(m => {
    const mentorReviews = reviewsByMentor[m.id] || [];
    const avgRating = mentorReviews.length
      ? (mentorReviews.reduce((sum, r) => sum + r.rating, 0) / mentorReviews.length).toFixed(1)
      : null;

    return {
      ...m.toJSON(),
      skills: m.mentorExpertise?.length ? m.mentorExpertise : (m.primarySkills || m.skills || []),
      sessionTypes: m.mentorExpertise?.length ? ['quick', 'standard', 'deep', 'review'] : ['standard'],
      availability: m.mentorAvailability || [
        { day: 'Mon', slots: ['10:00', '14:00'] },
        { day: 'Wed', slots: ['11:00', '15:00'] },
        { day: 'Fri', slots: ['09:00', '13:00'] },
      ],
      experience: m.yearsOfExperience || 0,
      location: [m.locationCity, m.locationCountry].filter(Boolean).join(', ') || 'Remote',
      responseTime: 'Within 24h',
      rating: avgRating || 'New',
      reviewCount: mentorReviews.length,
      reviews: mentorReviews,
    };
  });
};

export const listMentors = async (req, res) => {
  try {
    const { q = '', expertise = '', limit = 50 } = req.query;
    const where = { isMentor: true, isActive: true };
    if (expertise && expertise !== 'all') {
      where.mentorExpertise = { [Op.contains]: [expertise] };
    }
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { headline: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const mentors = await User.findAll({
      where,
      attributes: MENTOR_ATTRS,
      order: [['reputationScore', 'DESC']],
      limit: Math.min(parseInt(limit) || 50, 100),
    });

    const enriched = await enrichMentors(mentors);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMentor = async (req, res) => {
  try {
    const mentor = await User.findOne({
      where: { id: req.params.id, isMentor: true },
      attributes: MENTOR_ATTRS,
    });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

    const [enriched] = await enrichMentors([mentor]);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const becomeMentor = async (req, res) => {
  try {
    const { expertise = [], availability = null, hourlyRate = null } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const mergedExpertise = expertise.length
      ? expertise
      : [...new Set([...(user.primarySkills || []), ...(user.skills || [])])];

    await user.update({
      isMentor: true,
      mentorExpertise: mergedExpertise,
      mentorAvailability: availability || user.mentorAvailability,
    });

    res.json({ message: 'You are now a mentor', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bookSession = async (req, res) => {
  try {
    const { mentorId, sessionType, date, topic, message, scheduledFor } = req.body;
    if (!mentorId) return res.status(400).json({ message: 'mentorId is required' });
    if (mentorId === req.userId) return res.status(400).json({ message: 'Cannot book a session with yourself' });

    const mentor = await User.findOne({ where: { id: mentorId, isMentor: true, isActive: true } });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

    const session = await MentorshipSession.create({
      mentor: mentorId,
      mentee: req.userId,
      sessionType: sessionType || 'standard',
      date,
      scheduledFor,
      topic,
      message,
      status: 'pending',
    });

    await User.increment('mentorshipCount', { by: 0, where: { id: mentorId } });

    await createNotification({
      user: mentorId,
      type: 'mentorship',
      title: 'New mentorship request',
      body: `${req.user.name || 'Someone'} booked a session with you`,
      data: { sessionId: session.id },
    });

    res.status(201).json({ message: 'Session booked', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await MentorshipSession.findAll({
      where: { [Op.or]: [{ mentor: req.userId }, { mentee: req.userId }] },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'mentorProfile', attributes: ['id', 'name', 'photos', 'headline'] },
        { model: User, as: 'menteeProfile', attributes: ['id', 'name', 'photos', 'headline'] },
      ],
    });

    const mapped = sessions.map(s => {
      const json = s.toJSON();
      return {
        ...json,
        mentor: json.mentorProfile || null,
        mentee: json.menteeProfile || null,
      };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSessionStatus = async (req, res) => {
  try {
    const session = await MentorshipSession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const isMentor = session.mentor === req.userId;
    const isMentee = session.mentee === req.userId;
    if (!isMentor && !isMentee) return res.status(403).json({ message: 'Not your session' });

    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid session status' });
    }

    await session.update({ status });
    res.json({ message: 'Session updated', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};