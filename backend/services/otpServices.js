const otpStore = {}; // In-memory

export const generateOtp = (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min expiry
  return otp;
};

export const verifyOtp = (phone, code) => {
  const record = otpStore[phone];
  if (!record) return false;
  if (Date.now() > record.expiresAt) return false;
  return record.otp === code;
};

