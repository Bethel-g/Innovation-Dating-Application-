import express from 'express';
import {
  sendMessage, getMessages, getConversations,
  getIcebreakerPrompt, deleteMessage, markAsRead,
} from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/conversations', getConversations);
router.get('/messages/:matchId', getMessages);
router.post('/messages', sendMessage);
router.delete('/messages/:messageId', deleteMessage);
router.put('/messages/:matchId/read', markAsRead);
router.get('/icebreaker/:matchId', getIcebreakerPrompt);

export default router;
