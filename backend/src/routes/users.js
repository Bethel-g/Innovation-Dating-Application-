import express from 'express';
import {
  updateProfile, getProfile, uploadPhotos, deletePhoto,
  setPrimaryPhoto, updatePreferences, updateLocation,
  completeOnboarding, getNearbyUsers, deactivateAccount,
  reportUser,
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateUser);

router.put('/profile', updateProfile);
router.get('/profile/:id', getProfile);
router.post('/photos', upload.array('photos', 6), uploadPhotos);
router.delete('/photos/:photoId', deletePhoto);
router.put('/photos/:photoId/primary', setPrimaryPhoto);
router.put('/preferences', updatePreferences);
router.put('/location', updateLocation);
router.put('/onboarding', completeOnboarding);
router.get('/nearby', getNearbyUsers);
router.post('/deactivate', deactivateAccount);
router.post('/report', reportUser);

export default router;
