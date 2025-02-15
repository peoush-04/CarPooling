import express from 'express';
import { getUserProfile, updateUserProfile, updatePrivacySettings,sendUserSMS } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { addEmergencyContacts } from '../controllers/userController.js';
const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profileUpdate', protect, updateUserProfile);
router.put('/privacy', protect, updatePrivacySettings);
router.post('/sendSMS', protect, sendUserSMS);
router.post('/emergency-contacts', protect, addEmergencyContacts);

export default router;
