import express from 'express';
import {
  createTask, getTasks, getTaskById, updateTask, deleteTask,
  getTaskBoard, reorderTasks,
} from '../controllers/taskController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/project/:projectId', createTask);
router.get('/project/:projectId', getTasks);
router.get('/project/:projectId/board', getTaskBoard);
router.put('/project/:projectId/reorder', reorderTasks);
router.get('/:taskId', getTaskById);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;
