import express from 'express';
import {
  createOrganization, listOrganizations, getOrganization,
  updateOrganization, addMember, removeMember, submitVerification,
} from '../controllers/organizationController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { ORG_TYPES } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', validate({
  body: {
    name: { type: 'string', required: true, minLen: 2, maxLen: 200 },
    type: { in: Object.values(ORG_TYPES) },
    mission: { type: 'string', maxLen: 5000 },
    focusAreas: { type: 'array' },
    sectors: { type: 'array' },
    website: { type: 'url' },
    email: { type: 'email' },
    locationCity: { type: 'string', maxLen: 100 },
    locationCountry: { type: 'string', maxLen: 100 },
  },
}), createOrganization);

router.get('/', listOrganizations);
router.get('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), getOrganization);
router.put('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), updateOrganization);

router.post('/:id/members', validate({
  params: { id: { type: 'uuid', required: true } },
  body: { userId: { type: 'uuid', required: true } },
}), addMember);

router.delete('/:id/members/:userId', validate({
  params: { id: { type: 'uuid', required: true }, userId: { type: 'uuid', required: true } },
}), removeMember);

router.post('/:id/verification', validate({
  params: { id: { type: 'uuid', required: true } },
  body: {
    documents: { type: 'array' },
    verificationNote: { type: 'string', maxLen: 2000 },
  },
}), submitVerification);

export default router;