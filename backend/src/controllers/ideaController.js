import { Op } from 'sequelize';
import Idea from '../models/Idea.js';
import User from '../models/User.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import { findPotentialMatches } from '../services/matchingService.js';
import { createNotification } from '../services/notificationService.js';

export const createIdea = async (req, res) => {
  try {
    const idea = await Idea.create({ ...req.body, author: req.userId });
    res.status(201).json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIdeas = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;

    const ideas = await Idea.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const authorIds = [...new Set(ideas.map(i => i.author))];
    const authors = await User.findAll({
      where: { id: authorIds },
      attributes: ['id', 'name', 'photos', 'healthSpecialty', 'innovationFocus'],
    });
    const authorMap = Object.fromEntries(authors.map(a => [a.id, a.toJSON()]));

    const enriched = ideas.map(i => ({
      ...i.toJSON(),
      author: authorMap[i.author] || { id: i.author },
    }));

    const total = await Idea.count({ where });
    res.json({ ideas: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    await idea.update({ viewCount: idea.viewCount + 1 });

    const author = await User.findByPk(idea.author, {
      attributes: ['id', 'name', 'photos', 'healthSpecialty', 'innovationFocus'],
    });

    res.json({ ...idea.toJSON(), author });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.author !== req.userId) return res.status(403).json({ message: 'Only the author can update' });

    await idea.update(req.body);
    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.author !== req.userId) return res.status(403).json({ message: 'Only the author can delete' });

    await idea.destroy();
    res.json({ message: 'Idea deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestCollaboration = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.author === req.userId) return res.status(400).json({ message: 'Cannot collaborate on your own idea' });

    const existing = idea.collaborationRequests.find(r => r.userId === req.userId);
    if (existing) return res.status(400).json({ message: 'Already requested' });

    const updatedRequests = [
      ...idea.collaborationRequests,
      {
        userId: req.userId,
        message: req.body.message || '',
        offeredRole: req.body.offeredRole || '',
        status: 'pending',
        requestedAt: new Date().toISOString(),
      },
    ];

    await idea.update({ collaborationRequests: updatedRequests });

    await createNotification({
      user: idea.author,
      type: 'collaboration_request',
      title: 'New collaboration request',
      body: `Someone wants to collaborate on "${idea.title}"`,
      data: { ideaId: idea.id },
    });

    res.json({ message: 'Collaboration requested' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondToCollaboration = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.author !== req.userId) return res.status(403).json({ message: 'Only the author can respond' });

    const { requestUserId, status } = req.body;
    const updatedRequests = idea.collaborationRequests.map(r => {
      if (r.userId === requestUserId) {
        return { ...r, status, respondedAt: new Date().toISOString() };
      }
      return r;
    });

    await idea.update({ collaborationRequests: updatedRequests });

    await createNotification({
      user: requestUserId,
      type: status === 'accepted' ? 'collaboration_accepted' : 'collaboration_rejected',
      title: status === 'accepted' ? 'Collaboration accepted!' : 'Collaboration update',
      body: status === 'accepted'
        ? `Your request to collaborate on "${idea.title}" was accepted!`
        : `Your request to collaborate on "${idea.title}" was declined.`,
      data: { ideaId: idea.id },
    });

    res.json({ message: `Collaboration ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuggestedCollaborators = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    const matches = await findPotentialMatches(req.userId, 10);
    const filtered = matches.filter(m => {
      const userSkills = (m.user.skills || []).map(s => typeof s === 'string' ? s : s.name);
      return idea.skillsNeeded.some(s => userSkills.includes(s));
    });

    res.json(filtered.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    const existing = await Like.findOne({
      where: { user: req.userId, targetType: 'idea', targetId: req.params.id },
    });

    if (existing) {
      await existing.destroy();
      await idea.update({ likeCount: Math.max(0, idea.likeCount - 1) });
      res.json({ liked: false });
    } else {
      await Like.create({ user: req.userId, targetType: 'idea', targetId: req.params.id });
      await idea.update({ likeCount: idea.likeCount + 1 });

      if (idea.author !== req.userId) {
        await createNotification({
          user: idea.author,
          type: 'idea_liked',
          title: 'Your idea was liked',
          body: `Someone liked your idea "${idea.title}"`,
          data: { ideaId: idea.id },
        });
      }

      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
