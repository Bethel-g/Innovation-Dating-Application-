import express from 'express';
import { endorse, getEndorsements, addSkill, removeSkill } from '../controllers/skillsController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/endorse/:userId', endorse);
router.get('/endorsements/:userId', getEndorsements);
router.post('/', addSkill);
router.delete('/:skill', removeSkill);

export default router;