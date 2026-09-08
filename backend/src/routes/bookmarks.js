import express from 'express';
import { toggleBookmark, listBookmarks } from '../controllers/bookmarkController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', validate({
  body: {
    targetType: { type: 'string', required: true, in: ['idea', 'user', 'opportunity'] },
    targetId: { type: 'uuid', required: true },
  },
}), toggleBookmark);

router.get('/', listBookmarks);

export default router;