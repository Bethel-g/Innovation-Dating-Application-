import { Op } from 'sequelize';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import JobSave from '../models/JobSave.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

const shapeJob = (job, { isSaved = false, isApplied = false } = {}) => ({
  ...job.toJSON(),
  applicants: job.applicantCount || 0,
  posted: timeAgo(job.createdAt) || 'recently',
  isSaved: !!isSaved,
  isApplied: !!isApplied,
});

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    return skills.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export const listJobs = async (req, res) => {
  try {
    const { type = 'all', category = 'all', experience = 'all', remote = 'false', q = '' } = req.query;
    const status = req.query.status || 'open';

    const where = {};
    if (status !== 'all') where.status = status;
    if (type && type !== 'all') where.type = type;
    if (category && category !== 'all') where.category = category;
    if (experience && experience !== 'all') where.experience = experience;
    if (remote === 'true') where.remote = true;
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { company: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const jobs = await Job.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    const saves = await JobSave.findAll({ where: { user: req.userId } });
    const saveIds = new Set(saves.map(s => s.job));
    const apps = await JobApplication.findAll({ where: { applicant: req.userId } });
    const appJobIds = new Set(apps.map(a => a.job));

    res.json(jobs.map(j => shapeJob(j, { isSaved: saveIds.has(j.id), isApplied: appJobIds.has(j.id) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isSaved = Boolean(await JobSave.findOne({ where: { user: req.userId, job: job.id } }));
    const isApplied = Boolean(await JobApplication.findOne({ where: { applicant: req.userId, job: job.id } }));
    const author = await User.findByPk(job.author, { attributes: ['id', 'name', 'photos', 'headline'] });

    res.json({ ...shapeJob(job, { isSaved, isApplied }), poster: author });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const {
      title, company, location, type, salary, description,
      requirements, benefits, skills, category, experience, remote,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const job = await Job.create({
      author: req.userId,
      title,
      company: company || req.user.name || req.user.headline || 'New Company',
      location: location || 'Remote',
      type,
      salary,
      description,
      category,
      experience,
      remote: remote === true || remote === 'true',
      requirements: Array.isArray(requirements) ? requirements : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      skills: normalizeSkills(skills),
      status: 'open',
    });

    res.status(201).json({ message: 'Job posted successfully', job: shapeJob(job, { isSaved: false }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.author !== req.userId) return res.status(403).json({ message: 'Only the poster can update this job' });

    await job.update(req.body);
    res.json({ message: 'Job updated', job: shapeJob(job) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.author !== req.userId && !['admin', 'moderator', 'support'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not allowed to delete this job' });
    }
    await job.destroy();
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.author === req.userId) return res.status(400).json({ message: 'You cannot apply to your own job' });
    if (job.status !== 'open') return res.status(400).json({ message: 'This job is no longer accepting applications' });

    const existing = await JobApplication.findOne({ where: { job: job.id, applicant: req.userId } });
    if (existing) return res.status(400).json({ message: 'You already applied to this job' });

    const { coverLetter, experience, availability, expectedSalary } = req.body;
    await JobApplication.create({
      job: job.id,
      applicant: req.userId,
      coverLetter,
      experience,
      availability,
      expectedSalary,
      status: 'applied',
    });

    await Job.increment('applicantCount', { by: 1, where: { id: job.id } });

    if (job.author !== req.userId) {
      await createNotification({
        user: job.author,
        type: 'job_application',
        title: 'New job application',
        body: `${req.user.name} applied to "${job.title}"`,
        data: { jobId: job.id },
      });
    }

    res.json({ message: 'Application submitted', application: { job: job.id, status: 'applied' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const apps = await JobApplication.findAll({
      where: { applicant: req.userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: Job, as: 'jobDetail' }],
    });

    const mapped = apps.map(a => {
      const job = a.jobDetail;
      return {
        id: a.id,
        status: a.status,
        createdAt: a.createdAt,
        availability: a.availability,
        expectedSalary: a.expectedSalary,
        job: job ? shapeJob(job) : null,
      };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleSaveJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existing = await JobSave.findOne({ where: { user: req.userId, job: job.id } });
    if (existing) {
      await existing.destroy();
      return res.json({ saved: false, message: 'Job removed from saved' });
    }

    await JobSave.create({ user: req.userId, job: job.id });
    res.json({ saved: true, message: 'Job saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const saves = await JobSave.findAll({
      where: { user: req.userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: Job, as: 'jobDetail' }],
    });

    const jobs = saves
      .filter(s => s.jobDetail)
      .map(s => shapeJob(s.jobDetail, { isSaved: true }));

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};