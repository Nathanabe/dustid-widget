import { Response, Request } from "express";
import { generateOtp, verifyOtp } from "../services/otpServices";

export const requestOtp = (req:Request, res:Response) => {
  const phone = req.body;
  console.log(phone);
  if (!phone)
    return res.status(400).json({ error: "Phone number is required" });

  const otp = generateOtp(phone);
  console.log(`🧪 OTP for ${phone}: ${otp}`);
  res.json({ message: "OTP sent (mocked)", otp }); // Return OTP only for testing
};

export const validateOtp = (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!verifyOtp(phone, otp)) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const token = generateToken(phone);
  res.json({ token });
};
function generateToken(phone: any) {
  throw new Error("Function not implemented.");
}

