import express from 'express';
import {
  applyToRole, getRoleApplications, respondToApplication,
  myTeams, getTeam, sendTeamMessage, getTeamMessages,
} from '../controllers/teamController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/mine', myTeams);
router.get('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), getTeam);
router.post('/:id/messages', validate({
  params: { id: { type: 'uuid', required: true } },
  body: {
    content: { type: 'string', required: true, minLen: 1, maxLen: 4000 },
    messageType: { in: ['text', 'image', 'file', 'system'] },
  },
}), sendTeamMessage);
router.get('/:id/messages', validate({ params: { id: { type: 'uuid', required: true } } }), getTeamMessages);

router.post('/roles/:roleId/apply', validate({
  params: { roleId: { type: 'uuid', required: true } },
  body: {
    message: { type: 'string', maxLen: 2000 },
    highlights: { type: 'array' },
  },
}), applyToRole);

router.get('/roles/:roleId/applications', validate({ params: { roleId: { type: 'uuid', required: true } } }), getRoleApplications);
router.put('/applications/:id', validate({
  params: { id: { type: 'uuid', required: true } },
  body: { status: { type: 'string', required: true, in: ['accepted', 'declined'] } },
}), respondToApplication);

export default router;