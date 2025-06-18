"use client";

import React, { useState, useCallback } from "react";
import { ArrowLeft, X, Calendar } from "lucide-react";
import type { Stage, Contact, DustidWidgetProps } from "./types";
import { COUNTRIES } from "./constants/countries";
import { apiService } from "./utils/api";
import ActionButton from "./components/ActionButton";
import Banner from "./components/Banner";
import ContactSearch from "./components/ContactSearch";
import CountrySelector from "./components/CountrySelector";
import OTPInput from "./components/OTPInput";
import PhoneInput from "./components/PhoneInput";


export default function DustidWidget({
  userName: initialUserName = "Michael",
}: DustidWidgetProps) {
  const [stage, setStage] = useState<Stage>("banner");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("KE");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resendCountdown, setResendCountdown] = useState(30);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [userName] = useState(initialUserName);
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Add responsive detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);

  const validatePhoneNumber = useCallback(
    (number: string): boolean => {
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
    },
    [selectedCountry]
  );

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (value.length <= 1 && /^\d*$/.test(value)) {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && otp[index] === "" && index > 0) {
        // Focus previous input
        const prevInput = document.querySelector(
          `input[aria-label="OTP digit ${index}"]`
        ) as HTMLInputElement;
        if (prevInput) prevInput.focus();
      }
    },
    [otp]
  );

  const handleSignup = async () => {
    if (validatePhoneNumber(phoneNumber)) {
      setIsLoading(true);
      try {
        await apiService.sendOTP(phoneNumber, countryCode);
        setStage("otp");
        setResendCountdown(30);
      } catch (error) {
        setPhoneError(
          error instanceof Error ? error.message : "Failed to send OTP"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length === 6) {
      setIsLoading(true);
      try {
        await apiService.verifyOTP(otpString);
        setStage("welcome");
      } catch (error) {
        console.error("Verification failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setStage("contactSelected");
  };

  const handleResendCode = async () => {
    try {
      await apiService.sendOTP(phoneNumber, countryCode);
      setResendCountdown(30);
    } catch (error) {
      console.error("Failed to resend code:", error);
    }
  };

  const goBack = () => {
    switch (stage) {
      case "signup":
        setStage("banner");
        break;
      case "otp":
        setStage("signup");
        break;
      case "contactSelected":
        setStage("welcome");
        break;
      case "shopping":
        setStage("contactSelected");
        break;
    }
  };

  const closeWidget = () => {
    setStage("banner");
    setPhoneNumber("");
    setOtp(Array(6).fill(""));
    setSelectedContact(null);
    setPhoneError("");
    setResendCountdown(30);
  };

  // Countdown timer effect
  React.useEffect(() => {
    let timer: number | undefined
    if (stage === "otp" && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown, stage]);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "8px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  const iconButtonStyle: React.CSSProperties = {
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  return (
    <div style={containerStyle}>
      {/* Banner Stage */}
      {stage === "banner" && (
        <Banner onSignupClick={() => setStage("signup")} />
      )}

      {/* Signup Stage */}
      {stage === "signup" && (
        <div
          style={{
            padding: "8px",
            backgroundColor: "#e9d5ff",
            borderRadius: "8px",
          }}
        >
          {isMobile ? (
            // Mobile Layout
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <button
                  onClick={goBack}
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
                    style={{ width: "20px", height: "20px", color: "black" }}
                  />
                </button>
                <button
                  onClick={closeWidget}
                  style={iconButtonStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  aria-label="Close widget"
                >
                  <X
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "black",
                      marginBottom: "16px",
                    }}
                  >
                    Sign in
                  </h2>

                  <div style={{ marginBottom: "8px" }}>
                    <CountrySelector
                      countries={COUNTRIES}
                      selectedCountry={countryCode}
                      onCountryChange={setCountryCode}
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ marginBottom: phoneError ? "20px" : "0" }}>
                    <PhoneInput
                      phoneNumber={phoneNumber}
                      onPhoneChange={(phone) => {
                        setPhoneNumber(phone);
                        setPhoneError("");
                      }}
                      selectedCountry={selectedCountry}
                      error={phoneError}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    alignSelf: phoneError ? "flex-start" : "flex-end",
                    marginTop: phoneError ? "52px" : "0",
                  }}
                >
                  <ActionButton onClick={handleSignup} loading={isLoading}>
                    Sign in
                  </ActionButton>
                </div>
              </div>
            </div>
          ) : (
            // Desktop Layout
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <button
                onClick={goBack}
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

              <h2
                style={{ fontSize: "14px", fontWeight: "600", color: "black" }}
              >
                Sign in
              </h2>

              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <CountrySelector
                  countries={COUNTRIES}
                  selectedCountry={countryCode}
                  onCountryChange={setCountryCode}
                />

                <PhoneInput
                  phoneNumber={phoneNumber}
                  onPhoneChange={(phone) => {
                    setPhoneNumber(phone);
                    setPhoneError("");
                  }}
                  selectedCountry={selectedCountry}
                  error={phoneError}
                />

                <ActionButton onClick={handleSignup} loading={isLoading}>
                  Sign in
                </ActionButton>
              </div>

              <button
                onClick={closeWidget}
                style={iconButtonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                aria-label="Close widget"
              >
                <X
                  style={{ width: "20px", height: "20px", color: "#6b7280" }}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* OTP Stage */}
      {stage === "otp" && (
        <div
          style={{
            padding: "8px",
            backgroundColor: "#e9d5ff",
            borderRadius: "8px",
          }}
        >
          {isMobile ? (
            // Mobile Layout
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <button
                  onClick={goBack}
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
                  onClick={closeWidget}
                  style={iconButtonStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  aria-label="Close widget"
                >
                  <X
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                </button>
              </div>

              <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                We've sent an SMS with a verification code to your phone at{" "}
                <span style={{ fontWeight: "600" }}>
                  {selectedCountry?.dialCode} {phoneNumber}
                </span>
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  justifyContent: "space-between",
                }}
              >
                <OTPInput
                  otp={otp}
                  onOtpChange={handleOtpChange}
                  onKeyDown={handleKeyDown}
                />

                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <ActionButton onClick={handleVerify} loading={isLoading}>
                    Verify
                  </ActionButton>

                  {resendCountdown > 0 ? (
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Resend in {resendCountdown}s
                    </p>
                  ) : (
                    <ActionButton onClick={handleResendCode} variant="outline">
                      Resend
                    </ActionButton>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Desktop Layout
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <button
                onClick={goBack}
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

              <p style={{ fontSize: "14px", flex: 1, minWidth: 0 }}>
                We've sent an SMS with a verification code to your phone at{" "}
                <span style={{ fontWeight: "600" }}>
                  {selectedCountry?.dialCode} {phoneNumber}
                </span>
              </p>

              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <OTPInput
                  otp={otp}
                  onOtpChange={handleOtpChange}
                  onKeyDown={handleKeyDown}
                />

                <div
                  style={{ display: "flex", gap: "16px", alignItems: "center" }}
                >
                  <ActionButton onClick={handleVerify} loading={isLoading}>
                    Verify
                  </ActionButton>

                  {resendCountdown > 0 ? (
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>
                      Resend in {resendCountdown}s
                    </p>
                  ) : (
                    <ActionButton onClick={handleResendCode} variant="outline">
                      Resend
                    </ActionButton>
                  )}
                </div>
              </div>

              <button
                onClick={closeWidget}
                style={iconButtonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                aria-label="Close widget"
              >
                <X
                  style={{ width: "20px", height: "20px", color: "#6b7280" }}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Welcome Stage */}
      {stage === "welcome" && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#e9d5ff",
            borderRadius: "8px",
          }}
        >
          {isMobile ? (
            // Mobile Layout
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>
                  Welcome {userName}!
                </h2>
                <button
                  onClick={closeWidget}
                  style={iconButtonStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  aria-label="Close widget"
                >
                  <X
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                </button>
              </div>
              <ContactSearch onContactSelect={handleContactSelect} />
            </div>
          ) : (
            // Desktop Layout
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flex: 1,
                }}
              >
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Welcome {userName}!
                </h2>
                <ContactSearch onContactSelect={handleContactSelect} />
              </div>

              <button
                onClick={closeWidget}
                style={iconButtonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                aria-label="Close widget"
              >
                <X
                  style={{ width: "20px", height: "20px", color: "#6b7280" }}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contact Selected Stage */}
      {stage === "contactSelected" && selectedContact && (
        <div
          style={{
            padding: "8px",
            backgroundColor: "#e9d5ff",
            borderRadius: "8px",
          }}
        >
          {isMobile ? (
            // Mobile Layout
            <div>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                Welcome {userName}!
              </h2>

              <div
                style={{ display: "flex", gap: "8px", alignItems: "stretch" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px",
                    backgroundColor: "#7c3aed",
                    borderRadius: "6px",
                    color: "white",
                    flex: 1,
                  }}
                >
                  <img
                    src={
                      selectedContact.avatar ||
                      "/placeholder.svg?height=28&width=28"
                    }
                    alt={selectedContact.name}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedContact.name}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#c4b5fd",
                      }}
                    >
                      <Calendar
                        style={{
                          width: "8px",
                          height: "8px",
                          marginRight: "4px",
                        }}
                      />
                      <span>{selectedContact.date}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    flex: 1,
                  }}
                >
                  <ActionButton
                    onClick={() => setStage("shopping")}
                    style={{
                      fontSize: "12px",
                      padding: "6px 8px",
                      height: "50%",
                    }}
                  >
                    Send to contact
                  </ActionButton>
                  <ActionButton
                    onClick={() => setStage("welcome")}
                    variant="outline"
                    style={{
                      fontSize: "12px",
                      padding: "6px 8px",
                      height: "50%",
                    }}
                  >
                    Change contact
                  </ActionButton>
                </div>
              </div>
            </div>
          ) : (
            // Desktop Layout
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>
                Welcome {userName}!
              </h2>

              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px",
                    backgroundColor: "#7c3aed",
                    borderRadius: "6px",
                    color: "white",
                  }}
                >
                  <img
                    src={
                      selectedContact.avatar ||
                      "/placeholder.svg?height=28&width=28"
                    }
                    alt={selectedContact.name}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: "500" }}>
                      {selectedContact.name}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#c4b5fd",
                      }}
                    >
                      <Calendar
                        style={{
                          width: "8px",
                          height: "8px",
                          marginRight: "4px",
                        }}
                      />
                      <span>{selectedContact.date}</span>
                    </div>
                  </div>
                </div>

                <ActionButton
                  onClick={() => setStage("shopping")}
                  style={{ fontSize: "12px", padding: "4px 16px" }}
                >
                  Send to contact
                </ActionButton>

                <ActionButton
                  onClick={() => setStage("welcome")}
                  variant="outline"
                  style={{ fontSize: "12px", padding: "4px 16px" }}
                >
                  Change contact
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shopping Stage */}
      {stage === "shopping" && selectedContact && (
        <div
          style={{
            padding: "8px",
            backgroundColor: "#e9d5ff",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <button
              onClick={() => setStage("contactSelected")}
              style={{
                padding: "4px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f3f4f6")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <img
                src={
                  selectedContact.avatar ||
                  "/placeholder.svg?height=28&width=28"
                }
                alt={selectedContact.name}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  objectFit: "cover",
                  border: "1px solid #d1d5db",
                }}
              />
            </button>

            <p style={{ fontSize: isMobile ? "14px" : "12px" }}>
              You are currently shopping for{" "}
              <span style={{ fontWeight: "bold" }}>{selectedContact.name}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
