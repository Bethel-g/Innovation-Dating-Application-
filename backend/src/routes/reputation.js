import express from 'express';
import {
  getLeaderboard, getUserContributions, endorseSkill,
  getUserEndorsements, createReview, getUserReviews, getBadges,
} from '../controllers/reputationController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/leaderboard', getLeaderboard);
router.get('/contributions/:userId', getUserContributions);
router.post('/endorse', endorseSkill);
router.get('/endorsements/:userId', getUserEndorsements);
router.post('/reviews', createReview);
router.get('/reviews/:userId', getUserReviews);
router.get('/badges/:userId', getBadges);

export default router;
