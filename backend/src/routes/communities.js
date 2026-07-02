import express from 'express';
import {
  createCommunity, getCommunities, getCommunityById, updateCommunity,
  joinCommunity, leaveCommunity, getMyCommunities,
} from '../controllers/communityController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', createCommunity);
router.get('/', getCommunities);
router.get('/mine', getMyCommunities);
router.get('/:id', getCommunityById);
router.put('/:id', updateCommunity);
router.post('/:id/join', joinCommunity);
router.post('/:id/leave', leaveCommunity);

export default router;
