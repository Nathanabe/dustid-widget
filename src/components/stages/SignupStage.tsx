"use client";

import type React from "react";
import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import type { Country } from "../../types";
import CountrySelector from "../CountrySelector";
import PhoneInput from "../PhoneInput";
import ActionButton from "../ActionButton";
import { apiService } from "../../utils/api";

interface SignupStageProps {
  countries: Country[];
  onBack: () => void;
  onClose: () => void;
  onSuccess: (phoneNumber: string, countryCode: string) => void;
}

const SignupStage: React.FC<SignupStageProps> = ({
  countries,
  onBack,
  onClose,
  onSuccess,
}) => {
  const [country, setCountry] = useState("KE");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCountry = countries.find((c) => c.code === country);

  const containerStyle: React.CSSProperties = {
    padding: "8px",
    backgroundColor: "#e9d5ff",
    borderRadius: "8px",
  };

  const desktopLayoutStyle: React.CSSProperties = {
    display: "none",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
  };

  const mobileLayoutStyle: React.CSSProperties = {
    display: "block",
    gap: "16px",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "16px",
  };

  const formRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "16px",
    alignItems: "flex-end",
  };

  const iconButtonStyle: React.CSSProperties = {
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const validatePhoneNumber = (number: string): boolean => {
    if (!selectedCountry) return false;

    const cleanNumber = number.replace(/\D/g, "");
    if (cleanNumber.length === 0) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (cleanNumber.length !== selectedCountry.digits) {
      setPhoneError(`Phone number must be ${selectedCountry.digits} digits`);
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePhoneNumber(phoneNumber)) {
      setIsLoading(true);
      try {
        await apiService.sendOTP(phoneNumber, country);
        onSuccess(phoneNumber, country);
      } catch (error) {
        setPhoneError(
          error instanceof Error ? error.message : "Failed to send OTP"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    setPhoneError("");
  };

  // Media query simulation using window width
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <div style={containerStyle}>
      {/* Desktop Layout */}
      <div
        style={{ ...desktopLayoutStyle, display: isDesktop ? "flex" : "none" }}
      >
        <button
          onClick={onBack}
          style={iconButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f3f4f6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          aria-label="Go back"
        >
          <ArrowLeft
            style={{ width: "16px", height: "16px", color: "black" }}
          />
        </button>

        <h2 style={{ fontSize: "14px", fontWeight: "600", color: "black" }}>
          Sign in
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <CountrySelector
            countries={countries}
            selectedCountry={country}
            onCountryChange={setCountry}
          />

          <PhoneInput
            phoneNumber={phoneNumber}
            onPhoneChange={handlePhoneChange}
            selectedCountry={selectedCountry}
            error={phoneError}
          />

          <ActionButton onClick={handleSignup} loading={isLoading}>
            Sign in
          </ActionButton>
        </div>

        <button
          onClick={onClose}
          style={iconButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f3f4f6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          aria-label="Close widget"
        >
          <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        </button>
      </div>

      {/* Mobile Layout */}
      <div
        style={{ ...mobileLayoutStyle, display: isDesktop ? "none" : "block" }}
      >
        <div style={headerStyle}>
          <button
            onClick={onBack}
            style={iconButtonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            aria-label="Go back"
          >
            <ArrowLeft style={{ width: "20px", height: "20px" }} />
          </button>
          <button
            onClick={onClose}
            style={iconButtonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            aria-label="Close widget"
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        <div style={formRowStyle}>
          <div style={{ flex: 1 }}>
            <h2 style={titleStyle}>Sign in</h2>

            <div style={{ marginBottom: "8px" }}>
              <CountrySelector
                countries={countries}
                selectedCountry={country}
                onCountryChange={setCountry}
                style={{ width: "100%" }}
              />
            </div>

            <PhoneInput
              phoneNumber={phoneNumber}
              onPhoneChange={handlePhoneChange}
              selectedCountry={selectedCountry}
              error={phoneError}
              style={{ width: "100%" }}
            />
          </div>

          <ActionButton
            onClick={handleSignup}
            loading={isLoading}
            style={{
              alignSelf: "flex-end",
              marginBottom: phoneError ? "20px" : "0",
            }}
          >
            Sign in
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default SignupStage;
