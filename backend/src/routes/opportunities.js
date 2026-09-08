import express from 'express';
import {
  createOpportunity, listOpportunities, getOpportunity,
  updateOpportunity, updateOpportunityStatus, deleteOpportunity,
  applyToOpportunity, listApplications, respondToApplication,
  myOpportunityApplications,
} from '../controllers/opportunityController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { OPPORTUNITY_TYPE, OPPORTUNITY_STATUS } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', validate({
  body: {
    title: { type: 'string', required: true, minLen: 5, maxLen: 200 },
    description: { type: 'string', minLen: 20, maxLen: 10000 },
    type: { in: Object.values(OPPORTUNITY_TYPE) },
    eligibilityCriteria: { type: 'array' },
    sectors: { type: 'array' },
    skillsNeeded: { type: 'array' },
    deadline: { type: 'string' },
    capacity: { type: 'integer' },
    fundingAmount: { type: 'string', maxLen: 100 },
    externalLink: { type: 'url' },
    status: { in: Object.values(OPPORTUNITY_STATUS) },
  },
}), createOpportunity);

router.get('/', listOpportunities);
router.get('/applications/mine', myOpportunityApplications);
router.get('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), getOpportunity);
router.put('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), updateOpportunity);
router.patch('/:id/status', validate({
  params: { id: { type: 'uuid', required: true } },
  body: { status: { type: 'string', required: true, in: Object.values(OPPORTUNITY_STATUS) } },
}), updateOpportunityStatus);
router.delete('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), deleteOpportunity);

router.post('/:id/apply', validate({
  params: { id: { type: 'uuid', required: true } },
  body: {
    message: { type: 'string', maxLen: 3000 },
    ideaId: { type: 'uuid' },
  },
}), applyToOpportunity);

router.get('/:id/applications', validate({ params: { id: { type: 'uuid', required: true } } }), listApplications);
router.put('/applications/:id', validate({
  params: { id: { type: 'uuid', required: true } },
  body: { status: { type: 'string', required: true, in: ['accepted', 'declined'] } },
}), respondToApplication);

export default router;