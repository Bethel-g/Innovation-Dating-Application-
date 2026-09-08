import express from 'express';
import {
  sendRequest, listConnections, incomingRequests, sentRequests,
  respond, withdraw, relationshipStatus, ideaInterests,
} from '../controllers/connectionController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', validate({
  body: {
    recipient: { type: 'uuid' },
    ideaId: { type: 'uuid' },
    note: { type: 'string', maxLen: 600 },
  },
}), sendRequest);

router.get('/', listConnections);
router.get('/requests', incomingRequests);
router.get('/sent', sentRequests);
router.get('/status/:userId', validate({ params: { userId: { type: 'uuid', required: true } } }), relationshipStatus);
router.get('/ideas/:ideaId/interests', validate({ params: { ideaId: { type: 'uuid', required: true } } }), ideaInterests);
router.put('/:id', validate({
  params: { id: { type: 'uuid', required: true } },
  body: { status: { type: 'string', required: true, in: ['accepted', 'declined'] } },
}), respond);
router.delete('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), withdraw);

export default router;