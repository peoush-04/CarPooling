import Ride from '../models/Ride.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { sendSMS } from '../utils/twilioService.js';
// @desc Create a ride
// @route POST /api/rides
// @access Private (Only logged-in drivers)
export const createRide = async (req, res) => {
  try {
    if (req.user.role !== 'Driver') {
        return res.status(403).json({ message: 'Forbidden: Only Drivers can create rides' });
      }
    const { pickupLocation, dropLocation, departureTime, availableSeats, vehicle, preferences } = req.body;

    if (!pickupLocation || !dropLocation || !departureTime || !availableSeats) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const ride = new Ride({
      driver: req.user._id, // Assign driver ID from authenticated user
      pickupLocation,
      dropLocation,
      departureTime,
      availableSeats,
      vehicle,
      preferences,
    });

    const savedRide = await ride.save();
    res.status(201).json(savedRide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper Function: Calculate Route Match Percentage
const calculateMatchScore = (pickupRequested, dropRequested, departureTime, preferences, ride) => {
  let score = 0;

  // 1️⃣ Proximity Matching (Exact or Nearby Match)
  const locationMatch = (pickupRequested.toLowerCase() === ride.pickupLocation.toLowerCase() ? 0.5 : 0.25) +
                        (dropRequested.toLowerCase() === ride.dropLocation.toLowerCase() ? 0.5 : 0.25);
  
  // 2️⃣ Timing Similarity (15 min = Best, 1hr = Medium, >1hr = Weak)
  const requestedTime = new Date(departureTime).getTime();
  const rideTime = new Date(ride.departureTime).getTime();
  const timeDiff = Math.abs(requestedTime - rideTime) / (1000 * 60); // Convert to minutes

  let timingMatch = 0;
  if (timeDiff <= 15) timingMatch = 1;
  else if (timeDiff <= 30) timingMatch = 0.8;
  else if (timeDiff <= 60) timingMatch = 0.5;
  else timingMatch = 0.2;

  // 3️⃣ Preference Matching (Gender, Smoking, Pets)
  let preferenceMatch = 1;
  if (preferences) {
      let matchCount = 0, totalPrefs = Object.keys(preferences).length;
      Object.keys(preferences).forEach((key) => {
          if (preferences[key] === ride.preferences[key]) matchCount++;
      });
      preferenceMatch = matchCount / totalPrefs;
  }

  console.log("location : ",locationMatch);
  console.log("timing : ",timingMatch);
  console.log("preference : ",preferenceMatch);
  // Final Match Score (Weighted: Location 40%, Timing 40%, Preferences 20%)
  score = (locationMatch * 0.4) + (timingMatch * 0.4) + (preferenceMatch * 0.2);
  return score;
};

// 🔹 Intelligent Ride Search & Matching Function
export const findAndRequestRide = async (req, res) => {
  try {
      const { pickupLocation, dropLocation, departureTime, preferences } = req.query;
      const rider = await User.findById(req.user._id);

      if (!rider || rider.role !== 'Rider') {
          return res.status(403).json({ message: 'Only Riders can search and request rides' });
      }

      // Use rider-provided departure time or default to the current time
      const riderDepartureTime = departureTime ? new Date(departureTime) : new Date();

      // Fetch Available Rides (Only future rides based on rider's input)
      let filter = {
          pickupLocation: { $regex: pickupLocation, $options: 'i' },
          dropLocation: { $regex: dropLocation, $options: 'i' },
          availableSeats: { $gt: 0 }, // Ensure seats are available
          departureTime: { $gte: riderDepartureTime }, // Get rides departing after the rider's preferred time
      };

      let rides = await Ride.find(filter).populate('driver', 'name email role');

      // Rank Rides by Best Match Score
      const rankedRides = rides.map(ride => ({
          ...ride._doc,
          matchScore: calculateMatchScore(pickupLocation, dropLocation, departureTime, JSON.parse(preferences || '{}'), ride)
      }));

      // Sort by Highest Match Score
      rankedRides.sort((a, b) => b.matchScore - a.matchScore);

      res.json(rankedRides);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 🔹 Request to Join Ride
export const requestToJoinRide = async (req, res) => {
  try {
      const { rideId } = req.body;
      const rider = await User.findById(req.user._id);

      if (!rider || rider.role !== 'Rider') {
          return res.status(403).json({ message: 'Only Riders can request rides' });
      }

      const ride = await Ride.findById(rideId);
      if (!ride) {
          return res.status(404).json({ message: 'Ride not found' });
      }

      if (ride.availableSeats <= 0) {
          return res.status(400).json({ message: 'No seats available in this ride' });
      }

      // Send Request (Save in Ride Object)
      ride.requests = ride.requests || [];
      if (ride.requests.includes(rider._id)) {
          return res.status(400).json({ message: 'You have already requested this ride' });
      }

      ride.requests.push(rider._id);
      await ride.save();

      res.json({ message: 'Ride request sent successfully', rideId });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 🔹 Approve or Reject Ride Request (Only Driver)
export const respondToRideRequest = async (req, res) => {
  try {
      const { rideId, riderId, status } = req.body;
      const driver = await User.findById(req.user._id);
      const rider = await User.findById(riderId);
      const ride = await Ride.findById(rideId);

      if (!ride || ride.driver.toString() !== driver._id.toString()) {
          return res.status(404).json({ message: 'Ride not found or unauthorized' });
      }

      if (status === 'approve') {
          ride.passengers.push(riderId);
          ride.availableSeats--;

          ride.requests = ride.requests.filter(reqId => reqId.toString() !== riderId.toString());
          await ride.save();

          // Send SMS notification to Rider
          await sendSMS(rider.phone, `🚗 Your ride with ${driver.name} has been approved!`);

          res.json({ message: 'Ride request approved', rideId, riderId });
      } else if (status === 'reject') {
          ride.requests = ride.requests.filter(reqId => reqId.toString() !== riderId.toString());
          await ride.save();

          res.json({ message: 'Ride request rejected', rideId, riderId });
      } else {
          res.status(400).json({ message: 'Invalid status. Use "approve" or "reject"' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const shareLiveLocation = async (req, res) => {
  try {
      const user = await User.findById(req.user._id);
      if (!user || user.role !== 'Rider') {
          return res.status(403).json({ message: 'Only Riders can share location' });
      }

      const { location } = req.body;  // location = { lat, long }
      if (!location) {
          return res.status(400).json({ message: 'Location is required' });
      }

      // Send location update to all emergency contacts
      const messages = user.emergencyContacts.map(async (contact) => {
          return sendSMS(
              contact.phone,
              `🚗 ALERT: ${user.name} is currently on a ride. Live Location: ${location.lat}, ${location.long}.`
          );
      });

      await Promise.all(messages);

      res.json({ message: 'Live location shared with emergency contacts' });
  } catch (error) {
      res.status(500).json({ message: 'Failed to share location', error: error.message });
  }
};