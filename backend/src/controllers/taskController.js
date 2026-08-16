import { Op } from 'sequelize';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { createNotification } from '../services/notificationService.js';

export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const membership = await ProjectMember.findOne({
      where: { project: projectId, user: req.userId, status: 'approved' },
    });
    if (!membership) return res.status(403).json({ message: 'Not a project member' });

    const maxOrder = await Task.max('order', { where: { project: projectId } });
    const task = await Task.create({
      ...req.body,
      project: projectId,
      createdBy: req.userId,
      order: (maxOrder || 0) + 1,
    });

    await ActivityLog.create({
      groupType: 'project',
      groupId: projectId,
      user: req.userId,
      action: 'task_created',
      details: { taskId: task.id, title: task.title },
    });

    if (task.assignee && task.assignee !== req.userId) {
      await createNotification({
        user: task.assignee,
        type: 'task_assigned',
        title: 'New task assigned',
        body: `You've been assigned "${task.title}"`,
        data: { taskId: task.id, projectId },
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignee, priority } = req.query;

    const where = { project: projectId };
    if (status) where.status = status;
    if (assignee) where.assignee = assignee;
    if (priority) where.priority = priority;

    const tasks = await Task.findAll({
      where,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });

    const assigneeIds = [...new Set(tasks.map(t => t.assignee).filter(Boolean))];
    const assignees = assigneeIds.length > 0
      ? await User.findAll({ where: { id: assigneeIds }, attributes: ['id', 'name', 'photos'] })
      : [];
    const assigneeMap = Object.fromEntries(assignees.map(a => [a.id, a.toJSON()]));

    const enriched = tasks.map(t => ({
      ...t.toJSON(),
      assignee: t.assignee ? assigneeMap[t.assignee] || { id: t.assignee } : null,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const assignee = task.assignee
      ? await User.findByPk(task.assignee, { attributes: ['id', 'name', 'photos'] })
      : null;

    res.json({ ...task.toJSON(), assignee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await ProjectMember.findOne({
      where: { project: task.project, user: req.userId, status: 'approved' },
    });
    if (!membership) return res.status(403).json({ message: 'Not a project member' });

    const oldStatus = task.status;
    const oldAssignee = task.assignee;

    await task.update(req.body);

    if (req.body.status === 'done' && oldStatus !== 'done') {
      task.completedAt = new Date();
      await task.save();
    }

    await ActivityLog.create({
      groupType: 'project',
      groupId: task.project,
      user: req.userId,
      action: 'task_updated',
      details: { taskId: task.id, title: task.title, changes: req.body },
    });

    if (task.assignee && task.assignee !== oldAssignee && task.assignee !== req.userId) {
      await createNotification({
        user: task.assignee,
        type: 'task_assigned',
        title: 'Task assigned to you',
        body: `You've been assigned "${task.title}"`,
        data: { taskId: task.id, projectId: task.project },
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await ProjectMember.findOne({
      where: { project: task.project, user: req.userId, role: 'lead', status: 'approved' },
    });
    if (!membership) return res.status(403).json({ message: 'Only the project lead can delete tasks' });

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskBoard = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.findAll({
      where: { project: projectId },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });

    const board = {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      in_review: tasks.filter(t => t.status === 'in_review'),
      done: tasks.filter(t => t.status === 'done'),
      blocked: tasks.filter(t => t.status === 'blocked'),
    };

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { taskIds } = req.body;

    const membership = await ProjectMember.findOne({
      where: { project: projectId, user: req.userId, status: 'approved' },
    });
    if (!membership) return res.status(403).json({ message: 'Not a project member' });

    await Promise.all(
      taskIds.map((id, index) =>
        Task.update({ order: index }, { where: { id, project: projectId } })
      )
    );

    res.json({ message: 'Tasks reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
