import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to send SMS
export const sendSMS = async (to, message) => {
    try {
        const response = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,  // my twilio Number
            to,  // receiver's phone number
            body: message
        });
        return response.sid;  // Message SID for tracking
    } catch (error) {
        console.error('Twilio SMS Error:', error);
        throw new Error('Failed to send SMS');
    }
};
