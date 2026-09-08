import express from 'express';
import {
  createIdea, getIdeas, getIdeaById, updateIdea, updateIdeaStatus, deleteIdea,
  expressInterest, likeIdea, getSuggestedCollaborators,
  addOpenRole, listOpenRoles, updateOpenRole, deleteOpenRole,
} from '../controllers/ideaController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { IDEA_STATUS, IDEA_STAGE, SECTORS } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', validate({
  body: {
    title: { type: 'string', required: true, minLen: 5, maxLen: 200 },
    description: { type: 'string', required: true, minLen: 20, maxLen: 5000 },
    sector: { in: SECTORS },
    stage: { in: Object.values(IDEA_STAGE) },
    desiredOutcome: { type: 'string', maxLen: 2000 },
    problemStatement: { type: 'string', maxLen: 5000 },
    proposedSolution: { type: 'string', maxLen: 5000 },
    skillsNeeded: { type: 'array' },
    tags: { type: 'array' },
    attachments: { type: 'array' },
    visibility: { in: ['public', 'private', 'invite_only'] },
  },
}), createIdea);

router.get('/', getIdeas);
router.get('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), getIdeaById);
router.put('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), updateIdea);
router.patch('/:id/status', validate({
  params: { id: { type: 'uuid', required: true } },
  body: { status: { type: 'string', required: true, in: Object.values(IDEA_STATUS) } },
}), updateIdeaStatus);
router.delete('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), deleteIdea);

router.post('/:id/interest', validate({
  params: { id: { type: 'uuid', required: true } },
  body: { note: { type: 'string', maxLen: 600 } },
}), expressInterest);

router.post('/:id/like', validate({ params: { id: { type: 'uuid', required: true } } }), likeIdea);
router.get('/:id/suggested-collaborators', validate({ params: { id: { type: 'uuid', required: true } } }), getSuggestedCollaborators);

router.post('/:id/roles', validate({
  params: { id: { type: 'uuid', required: true } },
  body: {
    title: { type: 'string', required: true, minLen: 2, maxLen: 120 },
    roleType: { type: 'string' },
    description: { type: 'string', maxLen: 2000 },
    skillsNeeded: { type: 'array' },
  },
}), addOpenRole);

router.get('/:id/roles', validate({ params: { id: { type: 'uuid', required: true } } }), listOpenRoles);
router.put('/:id/roles/:roleId', validate({
  params: { id: { type: 'uuid', required: true }, roleId: { type: 'uuid', required: true } },
}), updateOpenRole);
router.delete('/:id/roles/:roleId', validate({
  params: { id: { type: 'uuid', required: true }, roleId: { type: 'uuid', required: true } },
}), deleteOpenRole);

export default router;