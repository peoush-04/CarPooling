import express from 'express';
import { 
    createRide, 
    findAndRequestRide, 
    requestToJoinRide, 
    respondToRideRequest 
} from '../controllers/rideController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Only Drivers can create rides
router.post('/', protect, authorize(['Driver']), createRide);

// ✅ Only Riders can search and request rides
router.get('/find', protect, authorize(['Rider']), findAndRequestRide);
router.post('/request', protect, authorize(['Rider']), requestToJoinRide);

// ✅ Only Drivers can approve or reject ride requests
router.put('/respond', protect, authorize(['Driver']), respondToRideRequest);

export default router;
