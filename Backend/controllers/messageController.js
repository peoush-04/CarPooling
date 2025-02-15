import Message from '../models/Message.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const sendMessage = async (req, res) => {
    const { receiver, message } = req.body;
  
    if (!receiver || !message) {
      return res.status(400).json({ message: 'Receiver and message are required' });
    }
  
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
  
    // ensure one user is a rider and the other is a driver
    if (req.user.role === receiverUser.role) {
      return res.status(403).json({ message: 'Forbidden: Messages can only be exchanged between a Rider and a Driver' });
    }
  
    const newMessage = new Message({
      sender: req.user._id,
      receiver,
      message,
    });
  
    await newMessage.save();
    res.status(201).json(newMessage);
  };

export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
