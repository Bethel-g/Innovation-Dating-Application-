import express from 'express';
import {
  createIdea, getIdeas, getIdeaById, updateIdea, deleteIdea,
  requestCollaboration, respondToCollaboration, getSuggestedCollaborators,
  likeIdea,
} from '../controllers/ideaController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', createIdea);
router.get('/', getIdeas);
router.get('/:id', getIdeaById);
router.put('/:id', updateIdea);
router.delete('/:id', deleteIdea);
router.post('/:id/like', likeIdea);
router.post('/:id/collaborate', requestCollaboration);
router.put('/:id/collaborate/respond', respondToCollaboration);
router.get('/:id/suggested-collaborators', getSuggestedCollaborators);

export default router;
