import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
  
  export const registerUser = async (req, res) => {
    const { name, email, password, phone, role } = req.body;
  
    try {
      // 🔹 Validate required fields
      if (!name || !email || !password || !phone || !role) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // 🔹 Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
  
      // 🔹 Validate password length (Minimum 6 characters)
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
  
      // 🔹 Validate phone number format (Only digits, length 10)
      const phoneRegex = /^\+\d{1,3}\d{10}$/;  // Format: +[country code][10-digit number]
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number. Format: +[country code][10-digit number] (e.g., +919876543210)' });
        }
  
      // 🔹 Validate role (Only "Driver" or "Rider")
      if (!['Driver', 'Rider'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Choose either Driver or Rider' });
      }
  
      // 🔹 Check if email already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
  
      // 🔹 Check if phone number already exists
      // const phoneExists = await User.findOne({ phone });
      // if (phoneExists) {
      //   return res.status(400).json({ message: 'User with this phone number already exists' });
      // }
  
      // password hashed in User.js before saving in db 

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role,
      });
  
      if (user) {
        generateToken(res, user._id);
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// @desc Login user & get token
// @route POST /api/auth/login
// @access Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      // Debugging: Check if the user exists
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Generate JWT Token
      generateToken(res, user._id);
  
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
// @desc Logout user
// @route POST /api/auth/logout
// @access Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully' });
};
