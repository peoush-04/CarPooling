import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    departureTime: { type: Date, required: true },
    availableSeats: { type: Number, required: true, min: 1 },
    vehicle: {
      model: String,
      licensePlate: String,
      color: String,
    },
    preferences: {
      music: { type: Boolean, default: false },
      smoking: { type: Boolean, default: false },
      petsAllowed: { type: Boolean, default: false },
    },
    requests: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // riders who requested this ride
    ],
    passengers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // approved passengers
    ],
  },
  { timestamps: true }
);

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;
