import { generateOtp, verifyOtp } from '../services/otpService.js';
import { generateToken } from '../utils/jwt.js';

export const requestOtp = (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  const otp = generateOtp(phone);
  console.log(`🧪 OTP for ${phone}: ${otp}`);
  res.json({ message: 'OTP sent (mocked)', otp }); // Return OTP only for testing
};

export const validateOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!verifyOtp(phone, otp)) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  const token = generateToken(phone);
  res.json({ token });
};
