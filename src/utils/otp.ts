
import { sendMail } from './mailservice';
import crypto from 'crypto';


const OTP_EXPIRATION_TIME = 5 * 60 * 1000; 
const OTP_KEY = process.env.OTP_KEY;

if (!OTP_KEY) {
    throw new Error('OTP_KEY is not defined in environment variables.');
}

export const generateOtpHash = (otp: string) => {
    return crypto.createHmac('sha256', OTP_KEY).update(otp).digest('hex');
};

export const generateOtp = async (email: string) => {
    if (!email) {
        throw new Error('Email is required.');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hash = generateOtpHash(otp);

    await sendMail(email, 'Your OTP Code', `<p>Your OTP is: <strong>${otp}</strong></p>`);

    return {
        hash,
        expiresAt: Date.now() + OTP_EXPIRATION_TIME,
    };
};