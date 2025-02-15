import User from '../models/User.js';
import { sendSMS } from '../utils/twilioService.js';
// @desc Get user profile
// @route GET /api/users/profile
// @access Private
export const getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Apply privacy settings
      const modifiedUser = {
        _id: user._id,
        name: user.privacySettings.hideFullName ? user.name.charAt(2) + '...' : user.name,
        email: user.email,
        phone: user.phone ? `+XX-XXXXXX${user.phone.slice(-4)}` : '', // Mask phone number
        profilePicture: user.privacySettings.blurProfilePicture ? 'blurred.jpg' : user.profilePicture,
      };
  
      res.json(modifiedUser);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password; // Will be hashed automatically

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePrivacySettings = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            'privacySettings.hideFullName': req.body.hideFullName,
            'privacySettings.blurProfilePicture': req.body.blurProfilePicture,
          },
        },
        { new: true, runValidators: false } // Disable full validation
      );
  
      res.json({ message: 'Privacy settings updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  export const sendUserSMS = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const messageSid = await sendSMS(user.phone, message);
        res.json({ message: 'SMS sent successfully', messageSid });
    } catch (error) {
        res.status(500).json({ message: 'SMS failed' });
    }
};

export const addEmergencyContacts = async (req, res) => {
  try {
    
      const user = await User.findById(req.user._id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      if (user.role !== 'Rider') {
        return res.status(403).json({ message: 'Only Riders can share location' });
    }

      user.emergencyContacts = req.body.contacts;  // List of { name, phone }
      await user.save();

      res.json({ message: 'Emergency contacts updated', contacts: user.emergencyContacts });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};