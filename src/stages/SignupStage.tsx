"use client";

import type React from "react";
import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import type { StageProps } from "../types";
import { COUNTRIES } from "../constants/countries";
import { styles } from "../styles";
import { apiService } from "../utils/api";
import { useResponsive } from "../utils/responsive";

interface SignupStageProps extends StageProps {
  data: {
    phoneNumber: string;
    countryCode: string;
    phoneError: string;
  };
}

const SignupStage: React.FC<SignupStageProps> = ({
  onNext,
  onBack,
  onClose,
  data,
  onDataChange,
}) => {
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === data.countryCode);

  const validatePhoneNumber = (number: string): boolean => {
    if (!selectedCountry) return false;

    const cleanNumber = number.replace(/\D/g, "");
    if (cleanNumber.length === 0) {
      onDataChange?.({ ...data, phoneError: "Phone number is required" });
      return false;
    }
    if (cleanNumber.length !== selectedCountry.digits) {
      onDataChange?.({
        ...data,
        phoneError: `Phone number must be ${selectedCountry.digits} digits`,
      });
      return false;
    }
    onDataChange?.({ ...data, phoneError: "" });
    return true;
  };

  const handleSignup = async () => {
    if (validatePhoneNumber(data.phoneNumber)) {
      setIsLoading(true);
      try {
        await apiService.sendOTP(data.phoneNumber, data.countryCode);
        onNext?.();
      } catch (error) {
        onDataChange?.({
          ...data,
          phoneError:
            error instanceof Error ? error.message : "Failed to send OTP",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updatePhoneNumber = (phoneNumber: string) => {
    onDataChange?.({ ...data, phoneNumber, phoneError: "" });
  };

  const updateCountryCode = (countryCode: string) => {
    onDataChange?.({ ...data, countryCode });
  };

  if (isMobile) {
    return (
      <div style={styles.stage}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // marginBottom: "10px",
          
          }}
        >
          <button
            onClick={onBack}
            style={styles.iconButton}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <ArrowLeft
              style={{ width: "20px", height: "20px", color: "black" }}
            />
          </button>
          <button
            onClick={onClose}
            style={styles.iconButton}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
          </button>
        </div>

        <div
          style={{
            padding: "0 10px",
            margin:"0"
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "black",
              marginBottom: "10px",
            }}
          >
            Sign in
          </h2>
          <section
            style={{
              display: "flex",
              justifyContent: "space-between",
             
            }}
          >
            <section>
              <select
                value={data.countryCode}
                onChange={(e) => updateCountryCode(e.target.value)}
                style={{
                  ...styles.select,
                  width: "200px",
                  marginBottom: "8px",
                }}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
              <div style={{}}>
                <div
                  style={{
                    display: "flex",
                    width: "200px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px",
                      borderRadius: "6px 0 0 6px",
                      backgroundColor: "white",
                      fontSize: "12px",
                      border: "1px solid #d1d5db",
                      borderRight: "1px solid #e5e7eb",
                    }}
                  >
                    {selectedCountry?.dialCode}
                  </span>
                  <input
                    type="tel"
                    value={data.phoneNumber}
                    onChange={(e) => updatePhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    style={{
                      ...styles.input,
                      borderRadius: "0 6px 6px 0",
                      flex: 1,
                      width: "20px",
                    }}
                  />
                </div>
                <section
                  style={
                    data.phoneError
                      ? {
                          visibility: "visible",
                        }
                      : { padding: "10px" }
                  }
                >
                  {data.phoneError && (
                    <p style={{ ...styles.error, padding: 0, margin: 0 }}>
                      {data.phoneError}
                    </p>
                  )}
                </section>
              </div>
            </section>

            <button
              onClick={handleSignup}
              disabled={isLoading}
              style={{
                ...styles.button("primary", isLoading),
                height: "28px",
                width: "100px",
                marginTop: "auto",
                padding: "0",
                marginBottom: "20px",
              }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.stage}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          width: "90%",
          margin: "auto",
        }}
      >
        <button onClick={onBack} style={styles.iconButton}>
          <ArrowLeft
            style={{ width: "16px", height: "16px", color: "black" }}
          />
        </button>
        <h2 style={{ fontSize: "14px", fontWeight: "600", color: "black" }}>
          Sign in
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <select
            value={data.countryCode}
            onChange={(e) => updateCountryCode(e.target.value)}
            style={styles.select}
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
          <div style={{ display: "flex" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 12px",
                borderRadius: "6px 0 0 6px",
                backgroundColor: "white",
                fontSize: "14px",
                border: "1px solid #d1d5db",
                borderRight: "1px solid #e5e7eb",
              }}
            >
              {selectedCountry?.dialCode}
            </span>
            <input
              type="tel"
              value={data.phoneNumber}
              onChange={(e) => updatePhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              style={{
                ...styles.input,
                borderRadius: "0 6px 6px 0",
              }}
            />
          </div>
          <button
            onClick={handleSignup}
            disabled={isLoading}
            style={styles.button("primary", isLoading)}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </div>
        <button onClick={onClose} style={styles.iconButton}>
          <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        </button>
      </div>
    </div>
  );
};

export default SignupStage;
