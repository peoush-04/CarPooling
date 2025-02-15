import express from 'express';
import { getUserProfile, updateUserProfile, updatePrivacySettings,callUserSecurely } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/privacy', protect, updatePrivacySettings); // New privacy settings route
router.post('/call', protect, callUserSecurely);

export default router;
