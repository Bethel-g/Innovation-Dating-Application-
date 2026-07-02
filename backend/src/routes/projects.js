import express from 'express';
import {
  createProject, getProjects, getProjectById, updateProject, deleteProject,
  applyToProject, approveMember, rejectMember,
  getProjectCollaborators, getPendingMembers, leaveProject,
} from '../controllers/projectController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/apply', applyToProject);
router.get('/:id/collaborators', getProjectCollaborators);
router.get('/:id/pending', getPendingMembers);
router.put('/members/:memberId/approve', approveMember);
router.put('/members/:memberId/reject', rejectMember);
router.post('/:id/leave', leaveProject);

export default router;
