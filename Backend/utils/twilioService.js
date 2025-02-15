import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio Client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to send SMS
export const sendSMS = async (to, message) => {
    try {
        const response = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,  // Your Twilio Number
            to,  // Receiver's Phone Number
            body: message
        });
        return response.sid;  // Message SID for tracking
    } catch (error) {
        console.error('Twilio SMS Error:', error);
        throw new Error('Failed to send SMS');
    }
};
