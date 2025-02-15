import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
  
  export const registerUser = async (req, res) => {
    const { name, email, password, phone, role } = req.body;
  
    try {
      // validate required fields
      if (!name || !email || !password || !phone || !role) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
  
      // validate password length (minimum 6 characters)
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
  
      // validate phone number format (only digits, length 10)
      const phoneRegex = /^\+\d{1,3}\d{10}$/;  // Format: +[country code][10-digit number]
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number. Format: +[country code][10-digit number] (e.g., +919876543210)' });
        }
  
      // validate role (Only "Driver" or "Rider")
      if (!['Driver', 'Rider'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Choose either Driver or Rider' });
      }
  
      // check if email already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
  
      // check if phone number already exists
      // const phoneExists = await User.findOne({ phone });
      // if (phoneExists) {
      //   return res.status(400).json({ message: 'User with this phone number already exists' });
      // }

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

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
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

export const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully' });
};
