"use client";

import type React from "react";
import type { Country } from "../types";

interface PhoneInputProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  selectedCountry: Country | undefined;
  error?: string;
  style?: React.CSSProperties;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  phoneNumber,
  onPhoneChange,
  selectedCountry,
  error,
  style = {},
}) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    ...style,
  };

  const prefixStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "6px 0 0 6px",
    backgroundColor: "white",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRight: "1px solid #e5e7eb",
  };

  const inputStyle: React.CSSProperties = {
    padding: "6px 12px",
    backgroundColor: "white",
    borderRadius: "0 6px 6px 0",
    border: "1px solid #d1d5db",
    outline: "none",
    flex: 1,
  };

  const errorStyle: React.CSSProperties = {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "4px",
  };

  return (
    <div>
      <div style={containerStyle}>
        <span style={prefixStyle}>{selectedCountry?.dialCode}</span>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Enter phone number"
          style={inputStyle}
          aria-label="Phone number"
        />
      </div>
      {error && (
        <p style={errorStyle} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
