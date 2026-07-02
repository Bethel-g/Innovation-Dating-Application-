import express from 'express';
import jwt from 'jsonwebtoken';
import {
  getDashboardStats, getUsers, getUserDetails,
  updateUser, deleteUser, getReports, resolveReport,
  getFlaggedMessages, moderateMessage, getAnalytics,
  getCampaigns, createCampaign, sendCampaign,
} from '../controllers/adminController.js';
import { authenticateUser, requireAdmin, requireRole, requirePermission } from '../middleware/auth.js';
import User from '../models/User.js';
import { generateToken } from '../utils/helpers.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!['admin', 'moderator', 'support'].includes(user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    const token = generateToken(user.id);
    res.json({ token, admin: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.use(authenticateUser);
router.use(requireAdmin);

router.get('/dashboard', requirePermission('analytics'), getDashboardStats);
router.get('/analytics', requirePermission('analytics'), getAnalytics);

router.get('/users', requirePermission('userManagement'), getUsers);
router.get('/users/:id', requirePermission('userManagement'), getUserDetails);
router.put('/users/:id', requirePermission('userManagement'), updateUser);
router.delete('/users/:id', requirePermission('userManagement'), deleteUser);

router.get('/reports', requirePermission('contentModeration'), getReports);
router.put('/reports/:id', requirePermission('contentModeration'), resolveReport);
router.get('/flagged-messages', requirePermission('contentModeration'), getFlaggedMessages);
router.put('/messages/:id/moderate', requirePermission('contentModeration'), moderateMessage);

router.get('/campaigns', requirePermission('notificationManagement'), getCampaigns);
router.post('/campaigns', requirePermission('notificationManagement'), createCampaign);
router.post('/campaigns/:id/send', requirePermission('notificationManagement'), sendCampaign);

export default router;
