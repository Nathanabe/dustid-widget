"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, X } from "lucide-react"
import type { Country } from "../../types"
import OTPInput from "../OTPInput"
import ActionButton from "../ActionButton"
import { apiService } from "../../utils/api"

interface OTPStageProps {
  phoneNumber: string
  selectedCountry: Country | undefined
  onBack: () => void
  onClose: () => void
  onSuccess: () => void
}

const OTPStage: React.FC<OTPStageProps> = ({ phoneNumber, selectedCountry, onBack, onClose, onSuccess }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [resendCountdown, setResendCountdown] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const containerStyle: React.CSSProperties = {
    padding: "8px",
    backgroundColor: "#e9d5ff",
    borderRadius: "8px",
  }

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  }

  const iconButtonStyle: React.CSSProperties = {
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "background-color 0.2s",
  }

  const messageStyle: React.CSSProperties = {
    fontSize: "14px",
    flex: 1,
    minWidth: 0,
  }

  const phoneStyle: React.CSSProperties = {
    fontWeight: "600",
  }

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  }

  const countdownStyle: React.CSSProperties = {
    color: "#6b7280",
    fontSize: "14px",
  }

  const errorStyle: React.CSSProperties = {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "8px",
    textAlign: "center",
  }

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (value.length <= 1 && /^\d*$/.test(value)) {
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        setError("")
      }
    },
    [otp],
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && otp[index] === "" && index > 0) {
        // Focus previous input on backspace
        const prevInput = document.querySelector(`input[aria-label="OTP digit ${index}"]`) as HTMLInputElement
        if (prevInput) prevInput.focus()
      }
    },
    [otp],
  )

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")
    if (otpString.length === 6) {
      setIsLoading(true)
      try {
        await apiService.verifyOTP(otpString)
        onSuccess()
      } catch (error) {
        setError(error instanceof Error ? error.message : "Verification failed")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleResendCode = async () => {
    try {
      await apiService.sendOTP(phoneNumber, selectedCountry?.code || "KE")
      setResendCountdown(30)
      setError("")
    } catch (error) {
      setError("Failed to resend code" + error)
    }
  }

  // Countdown timer
  useEffect(() => {
    let timer: number | undefined;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <button
          onClick={onBack}
          style={iconButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          aria-label="Go back"
        >
          <ArrowLeft style={{ width: "20px", height: "20px" }} />
        </button>

        <p style={messageStyle}>
          We've sent an SMS with a verification code to your phone at{" "}
          <span style={phoneStyle}>
            {selectedCountry?.dialCode} {phoneNumber}
          </span>
        </p>

        <div style={actionsStyle}>
          <OTPInput otp={otp} onOtpChange={handleOtpChange} onKeyDown={handleKeyDown} />

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <ActionButton onClick={handleVerify} loading={isLoading}>
              Verify
            </ActionButton>

            {resendCountdown > 0 ? (
              <p style={countdownStyle}>Resend in {resendCountdown}s</p>
            ) : (
              <ActionButton onClick={handleResendCode} variant="outline">
                Resend
              </ActionButton>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          style={iconButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          aria-label="Close widget"
        >
          <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        </button>
      </div>

      {error && (
        <div style={errorStyle} role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

export default OTPStage
