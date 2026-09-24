import express from 'express';
import {
  swipe, getMatches, getPotentialMatches, getDailySuggestions,
  getMatchInsight, blockUser, getSwipeCount,
  getRecommendedConnections, getHealthSector,
} from '../controllers/matchController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/swipe', swipe);
router.get('/', getMatches);
router.get('/potential', getPotentialMatches);
router.get('/daily', getDailySuggestions);
router.get('/health-sector', getHealthSector);
router.get('/recommended', getRecommendedConnections);
router.get('/insight/:matchId', getMatchInsight);
router.post('/block', blockUser);
router.get('/swipe-count', getSwipeCount);

export default router;
