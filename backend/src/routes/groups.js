import express from 'express';
import {
  sendGroupMessage, getGroupMessages, getActivityLog,
  uploadFile, getFiles, deleteFile,
} from '../controllers/groupController.js';
import { authenticateUser } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/:groupType/:groupId/messages', sendGroupMessage);
router.get('/:groupType/:groupId/messages', getGroupMessages);
router.get('/:groupType/:groupId/activity', getActivityLog);
router.post('/:groupType/:groupId/files', upload.single('file'), uploadFile);
router.get('/:groupType/:groupId/files', getFiles);
router.delete('/files/:fileId', deleteFile);

export default router;
