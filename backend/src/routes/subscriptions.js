import express from 'express';
import {
  getCurrentSubscription, upgradeSubscription, cancelSubscription,
  getSubscriptionHistory, getAvailablePlans,
} from '../controllers/subscriptionController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/current', getCurrentSubscription);
router.get('/plans', getAvailablePlans);
router.get('/history', getSubscriptionHistory);
router.post('/upgrade', upgradeSubscription);
router.post('/cancel', cancelSubscription);

export default router;
