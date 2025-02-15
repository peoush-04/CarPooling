import twilio from 'twilio';

// Twilio Credentials (Replace with real Twilio credentials)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const makeMaskedCall = async (fromUser, toUser) => {
  try {
    const call = await client.calls.create({
      twiml: '<Response><Say>Your call is being connected securely.</Say></Response>',
      to: toUser.phone,
      from: twilioNumber,
    });

    return call.sid;
  } catch (error) {
    throw new Error('Failed to initiate call');
  }
};
