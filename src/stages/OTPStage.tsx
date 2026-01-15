"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import type { StageProps } from "../types";
import { COUNTRIES } from "../constants/countries";
import { styles } from "../styles";
import { apiService } from "../utils/api";
import { useResponsive } from "../utils/responsive";

interface OTPStageProps extends StageProps {
  data: {
    phoneNumber: string;
    countryCode: string;
    otp: string[];
    resendCountdown: number;
  };
}

const OTPStage: React.FC<OTPStageProps> = ({
  onNext,
  onBack,
  onClose,
  data,
  onDataChange,
}) => {
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const selectedCountry = COUNTRIES.find((c) => c.code === data.countryCode);

  useEffect(() => {
    if (otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer: number;
    if (data.resendCountdown > 0) {
      timer = window.setTimeout(() => {
        onDataChange?.({ ...data, resendCountdown: data.resendCountdown - 1 });
      }, 1000);
    }
    return () => window.clearTimeout(timer);
  }, [data.resendCountdown, data, onDataChange]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...data.otp];
      newOtp[index] = value;
      onDataChange?.({ ...data, otp: newOtp });

      if (value !== "" && index < 5) {
        setTimeout(() => {
          otpRefs.current[index + 1]?.focus();
        }, 0);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && data.otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = data.otp.join("");
    if (otpString.length === 6) {
      setIsLoading(true);
      try {
        // build full phone number (dial code + cleaned number) to send to verify endpoint
        const country = COUNTRIES.find((c) => c.code === data.countryCode);
        const dial = country?.dialCode?.replace(/\D/g, "") || "";
        const cleaned = (data.phoneNumber || "").replace(/\D/g, "");
        const fullPhone = cleaned.startsWith(dial) || !dial ? cleaned : `${dial}${cleaned}`;

        await apiService.verifyOTP(otpString, fullPhone);
        onNext?.();
      } catch (error) {
        console.error("Verification failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendCode = async () => {
    try {
      await apiService.sendOTP(data.phoneNumber, data.countryCode);
      onDataChange?.({ ...data, resendCountdown: 30 });
    } catch (error) {
      console.error("Failed to resend code:", error);
    }
  };

  if (isMobile) {
    return (
      <div style={styles.stage}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button onClick={onBack} style={styles.iconButton}>
            <ArrowLeft style={{ width: "20px", height: "20px" }} />
          </button>
          <button onClick={onClose} style={styles.iconButton}>
            <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
          </button>
        </div>
        <div style={{ padding: "0 10px" }}>
          <p style={{ fontSize: "12px", marginBottom: "6px" }}>
            We've sent an SMS with a verification code to your phone at{" "}
            <span style={{ fontWeight: "600", display: "block" }}>
              {selectedCountry?.dialCode} {data.phoneNumber}
            </span>
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              justifyContent: "space-between",
            
              marginBottom: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "4px" }}>
              {data.otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  type="number"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: "20px",
                    height: "28px",
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: "600",
                    backgroundColor: "white",
                    borderRadius: "25%",
                    border: "1px solid #d1d5db",
                    outline: "none",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={handleVerify}
                disabled={isLoading}
                style={{
                  ...styles.button("primary", isLoading),
                  width: "100px",
                  height: "28px",
                  backgroundColor: "#54358C",
                  fontSize: "12px",
                  fontWeight:"light"
                }}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>

            {data.resendCountdown > 0 ? (
              <p style={{ color: "#6b7280", fontSize: "12px" }}>
                Resend in {data.resendCountdown}s
              </p>
            ) : (
              <button
                onClick={handleResendCode}
                style={{
                  ...styles.button("outline"),
                  height: "28px",
                  fontSize: "12px",
                  fontWeight:"light"
                }}
              >
                Resend
              </button>
            )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.stage}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <button onClick={onBack} style={styles.iconButton}>
          <ArrowLeft style={{ width: "20px", height: "20px" }} />
        </button>

        <p style={{ fontSize: "14px", flex: 1, minWidth: 0 }}>
          We've sent an SMS with a verification code to your phone at{" "}
          <span style={{ fontWeight: "600" }}>
            {selectedCountry?.dialCode} {data.phoneNumber}
          </span>
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {data.otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                  width: "24px",
                  height: "32px",
                  textAlign: "center",
                  fontSize: "18px",
                  fontWeight: "600",
                  backgroundColor: "white",
                  borderRadius: "25%",
                  border: "1px solid #d1d5db",
                  outline: "none",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <button
              onClick={handleVerify}
              disabled={isLoading}
              style={styles.button("primary", isLoading)}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>

            {data.resendCountdown > 0 ? (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Resend in {data.resendCountdown}s
              </p>
            ) : (
              <button
                onClick={handleResendCode}
                style={styles.button("outline")}
              >
                Resend
              </button>
            )}
          </div>
        </div>

        <button onClick={onClose} style={styles.iconButton}>
          <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        </button>
      </div>
    </div>
  );
};

export default OTPStage;
