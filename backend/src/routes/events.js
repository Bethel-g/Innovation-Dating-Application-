import express from 'express';
import {
  listEvents, getEvent, createEvent, updateEvent, deleteEvent,
  toggleRegister, getMyEvents,
} from '../controllers/eventController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', listEvents);
router.get('/registered', getMyEvents);
router.get('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), getEvent);
router.post('/', validate({
  body: {
    title: { type: 'string', required: true, minLen: 2, maxLen: 200 },
    description: { type: 'string', maxLen: 10000 },
    type: { type: 'string' },
    location: { type: 'string', maxLen: 300 },
    maxAttendees: { type: 'number' },
    tags: { type: 'array' },
    speakers: { type: 'array' },
  },
}), createEvent);

router.post('/:id/register', validate({ params: { id: { type: 'uuid', required: true } } }), toggleRegister);
router.put('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), updateEvent);
router.delete('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), deleteEvent);

export default router;