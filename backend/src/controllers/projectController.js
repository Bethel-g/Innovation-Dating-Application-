import { Op } from 'sequelize';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import User from '../models/User.js';
import { findProjectCollaborators } from '../services/matchingService.js';
import { calculateInnovationScore } from '../services/aiService.js';

export const createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, author: req.userId });
    await ProjectMember.create({
      project: project.id,
      user: req.userId,
      role: 'lead',
      status: 'approved',
      joinedAt: new Date(),
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, focus, stage } = req.query;
    const where = {};

    if (status) where.status = status;
    if (focus) where.innovationFocus = focus;
    if (stage) where.stage = stage;

    if (req.query.mine === 'true') {
      const memberships = await ProjectMember.findAll({
        where: { user: req.userId, status: 'approved' },
        attributes: ['project'],
      });
      where.id = { [Op.in]: memberships.map(m => m.project) };
    }

    const projects = await Project.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    const leadIds = [...new Set(projects.map(p => p.author).filter(Boolean))];
    const leads = await User.findAll({
      where: { id: leadIds },
      attributes: ['id', 'name', 'photos', 'healthSpecialty'],
    });
    const leadMap = Object.fromEntries(leads.map(l => [l.id, l.toJSON()]));

    const enriched = await Promise.all(projects.map(async p => {
      const memberCount = await ProjectMember.count({ where: { project: p.id, status: 'approved' } });
      return { ...p.toJSON(), lead: leadMap[p.author] || null, memberCount };
    }));

    const total = await Project.count({ where });
    res.json({ projects: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const members = await ProjectMember.findAll({
      where: { project: project.id, status: 'approved' },
    });
    const userIds = members.map(m => m.user);
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'photos', 'healthSpecialty', 'innovationFocus'],
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u.toJSON()]));

    const enrichedMembers = members.map(m => ({
      ...m.toJSON(),
      user: userMap[m.user] || { id: m.user },
    }));

    res.json({ ...project.toJSON(), members: enrichedMembers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const membership = await ProjectMember.findOne({
      where: { project: project.id, user: req.userId, role: 'lead', status: 'approved' },
    });
    if (!membership) return res.status(403).json({ message: 'Only the project lead can update' });

    await project.update(req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const membership = await ProjectMember.findOne({
      where: { project: project.id, user: req.userId, role: 'lead' },
    });
    if (!membership) return res.status(403).json({ message: 'Only the project lead can delete' });

    await ProjectMember.destroy({ where: { project: project.id } });
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyToProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const existing = await ProjectMember.findOne({ where: { project: project.id, user: req.userId } });
    if (existing) return res.status(400).json({ message: 'Already applied or member' });

    const membership = await ProjectMember.create({
      project: project.id,
      user: req.userId,
      role: req.body.role || 'contributor',
      status: 'pending',
    });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveMember = async (req, res) => {
  try {
    const membership = await ProjectMember.findByPk(req.params.memberId);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    const isLead = await ProjectMember.findOne({
      where: { project: membership.project, user: req.userId, role: 'lead', status: 'approved' },
    });
    if (!isLead) return res.status(403).json({ message: 'Only the project lead can approve members' });

    membership.status = 'approved';
    membership.joinedAt = new Date();
    await membership.save();

    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectMember = async (req, res) => {
  try {
    const membership = await ProjectMember.findByPk(req.params.memberId);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    const isLead = await ProjectMember.findOne({
      where: { project: membership.project, user: req.userId, role: 'lead', status: 'approved' },
    });
    if (!isLead) return res.status(403).json({ message: 'Only the project lead can reject members' });

    membership.status = 'rejected';
    await membership.save();

    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectCollaborators = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const matches = await findProjectCollaborators(project);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingMembers = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isLead = await ProjectMember.findOne({
      where: { project: project.id, user: req.userId, role: 'lead', status: 'approved' },
    });
    if (!isLead) return res.status(403).json({ message: 'Only the project lead can view pending members' });

    const pending = await ProjectMember.findAll({
      where: { project: project.id, status: 'pending' },
    });

    const userIds = pending.map(m => m.user);
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'photos', 'healthSpecialty', 'innovationFocus'],
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u.toJSON()]));

    const enriched = pending.map(m => ({ ...m.toJSON(), user: userMap[m.user] || { id: m.user } }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveProject = async (req, res) => {
  try {
    const membership = await ProjectMember.findOne({
      where: { project: req.params.id, user: req.userId, status: 'approved' },
    });
    if (!membership) return res.status(404).json({ message: 'Not a member of this project' });

    if (membership.role === 'lead') {
      const otherMembers = await ProjectMember.count({
        where: { project: req.params.id, status: 'approved', id: { [Op.ne]: membership.id } },
      });
      if (otherMembers > 0) {
        return res.status(400).json({ message: 'Transfer ownership before leaving' });
      }
    }

    membership.status = 'left';
    await membership.save();
    res.json({ message: 'Left project' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
