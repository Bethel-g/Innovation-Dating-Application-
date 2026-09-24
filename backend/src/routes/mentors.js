import express from 'express';
import {
  listMentors, getMentor, becomeMentor, bookSession, getSessions, updateSessionStatus,
} from '../controllers/mentorController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', listMentors);
router.get('/sessions', getSessions);
router.get('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), getMentor);

router.post('/become', validate({
  body: {
    expertise: { type: 'array' },
    availability: { type: 'object' },
    hourlyRate: { type: 'number' },
  },
}), becomeMentor);

router.post('/book', validate({
  body: {
    mentorId: { type: 'uuid', required: true },
    sessionType: { type: 'string' },
    date: { type: 'string' },
    topic: { type: 'string', maxLen: 200 },
    message: { type: 'string', maxLen: 2000 },
  },
}), bookSession);

router.put('/:id/status', validate({
  params: { id: { type: 'uuid', required: true } },
  body: { status: { type: 'string', required: true } },
}), updateSessionStatus);

export default router;