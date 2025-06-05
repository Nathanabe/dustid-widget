import React, { useState, useEffect, useRef } from "react";
import "./widget.css";
import type { MutableRefObject } from "react";

interface Contact {
  id: number;
  name: string;
  avatar: string;
}

interface DustidWidgetProps {
  userName?: string;
}

export function DustidWidget({ userName: initialUserName = "Juma" }: DustidWidgetProps) {
  const [stage, setStage] = useState<string>("banner");
  const [country, setCountry] = useState<string>("KE");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [userName] = useState<string>(initialUserName);
  const otpRefs: MutableRefObject<Array<HTMLInputElement | null>> = useRef([]);

  const mockContacts: Contact[] = [
    { id: 1, name: "Juma Mwangi", avatar: "/placeholder.svg" },
    { id: 2, name: "Sarah Kimani", avatar: "/placeholder.svg" },
    { id: 3, name: "David Ochieng", avatar: "/placeholder.svg" },
    { id: 4, name: "Mary Wanjiku", avatar: "/placeholder.svg" },
    { id: 5, name: "John Kamau", avatar: "/placeholder.svg" }
  ];

  const countries = [
    { code: "KE", name: "Kenya", dialCode: "+254" },
    { code: "UG", name: "Uganda", dialCode: "+256" },
    { code: "TZ", name: "Tanzania", dialCode: "+255" },
    { code: "RW", name: "Rwanda", dialCode: "+250" },
    { code: "ET", name: "Ethiopia", dialCode: "+251" }
  ];

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== "" && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStage("otp");
  };

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStage("welcome");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredContacts([]);
      setShowDropdown(false);
    } else {
      const filtered = mockContacts.filter((contact) =>
        contact.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
      setShowDropdown(true);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (stage === "otp" && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown, stage]);

  const handleResendCode = () => {
    setResendCountdown(30);
  };

  const getSelectedCountryDialCode = () => {
    return countries.find((c) => c.code === country)?.dialCode || "";
  };

  return (
    <div className="dustid-widget">
      {stage === "banner" && (
        <div onClick={() => setStage("signup")} style={{ cursor: "pointer" }}>
          <h2>Click here to be powered by DustID</h2>
        </div>
      )}
      {stage === "signup" && (
        <form onSubmit={handleSignup}>
          <label>Country:</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.dialCode})
              </option>
            ))}
          </select>
          <label>Phone Number:</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
      )}
      {stage === "otp" && (
        <form id="form" onSubmit={handleVerify}>
          <p>
            Enter OTP sent to {getSelectedCountryDialCode()} {phoneNumber}
          </p>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { otpRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{ width: "32px", textAlign: "center" }}
              />
            ))}
          </div>
          <button type="submit">Verify</button>
          <div>
            {resendCountdown > 0 ? (
              <p>Resend code in {resendCountdown}s</p>
            ) : (
              <button type="button" onClick={handleResendCode}>
                Resend Code
              </button>
            )}
          </div>
        </form>
      )}
      {stage === "welcome" && (
        <div>
          <h2>Welcome {userName}</h2>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {showDropdown && filteredContacts.length > 0 && (
            <ul>
              {filteredContacts.map((contact) => (
                <li
                  key={contact.id}
                  onClick={() => {
                    setSearchQuery(contact.name);
                    setShowDropdown(false);
                  }}
                >
                  <img src={contact.avatar} alt={contact.name} />
                  {contact.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 