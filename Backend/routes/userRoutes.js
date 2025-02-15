import express from 'express';
import { getUserProfile, updateUserProfile, updatePrivacySettings,sendUserSMS } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
// import { sendSMS } from '../utils/twilioService.js';
import { addEmergencyContacts } from '../controllers/userController.js';
const router = express.Router();

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/privacy', protect, updatePrivacySettings); // New privacy settings route
router.post('/sendSMS', protect, sendUserSMS);
router.post('/emergency-contacts', protect, addEmergencyContacts);

export default router;
