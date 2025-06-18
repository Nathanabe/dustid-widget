"use client";

import type React from "react";
import { useRef, useEffect } from "react";

interface OTPInputProps {
  otp: string[];
  onOtpChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ otp, onOtpChange, onKeyDown }) => {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, []);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    gap: "4px",
  };

  const inputStyle: React.CSSProperties = {
    width: "24px",
    height: "32px",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "600",
    backgroundColor: "white",
    borderRadius: "50%",
    border: "1px solid #d1d5db",
    outline: "none",
  };

//   const focusStyle: React.CSSProperties = {
//     ...inputStyle,
//     borderColor: "#7c3aed",
//     boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.2)",
//   };

  return (
    <div style={containerStyle}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            otpRefs.current[index] = el;
          }}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => onOtpChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onFocus={(e) => {
            e.target.style.borderColor = "#7c3aed";
            e.target.style.boxShadow = "0 0 0 2px rgba(124, 58, 237, 0.2)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#d1d5db";
            e.target.style.boxShadow = "none";
          }}
          style={inputStyle}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
