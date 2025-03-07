import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true },
    role: {
      type: String,
      required:true,
      enum: ['Driver', 'Rider'], // Only allow "driver" or "rider"
      default: 'Rider',
    },
    profilePicture: {
      type: String, // url of the profile picture
    },
    privacySettings: {
      hideFullName: { type: Boolean, default: false },
      blurProfilePicture: { type: Boolean, default: false },
    },
    
    emergencyContacts: [
        {
            name: { type: String, required: true },
            phone: { type: String, required: true }
        }
    ]
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
