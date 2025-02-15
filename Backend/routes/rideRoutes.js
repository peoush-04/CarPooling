import express from 'express';
import { 
    createRide, 
    findAndRequestRide, 
    requestToJoinRide, 
    respondToRideRequest 
} from '../controllers/rideController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { shareLiveLocation } from '../controllers/rideController.js';
const router = express.Router();

// Only drivers can create rides
router.post('/create', protect, authorize(['Driver']), createRide);

// Only riders can search and request rides
router.get('/find', protect, authorize(['Rider']), findAndRequestRide);
router.post('/request', protect, authorize(['Rider']), requestToJoinRide);

// only drivers can approve or reject ride requests
router.put('/respond', protect, authorize(['Driver']), respondToRideRequest);

router.post('/share-location', protect, shareLiveLocation);

export default router;
