import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true }, // Ensure phone remains required
    role: {
      type: String,
      required:true,
      enum: ['Driver', 'Rider'], // Only allow "Driver" or "Rider"
      default: 'Rider', // Default role is Rider
    },
    profilePicture: {
      type: String, // URL of the profile picture
    },
    privacySettings: {
      hideFullName: { type: Boolean, default: false },
      blurProfilePicture: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash password only if it's changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
