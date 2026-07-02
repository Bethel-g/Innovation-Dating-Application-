import express from 'express';
import { register, login, socialLogin, getMe, logout } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/social-login', socialLogin);
router.get('/me', authenticateUser, getMe);
router.post('/logout', authenticateUser, logout);

export default router;
