"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { ArrowLeft, X, Calendar } from "lucide-react";

interface Contact {
  id: number;
  name: string;
  avatar: string;
  date?: string;
}

interface DustidWidgetProps {
  userName?: string;
}

export function DustidWidget({
  userName: initialUserName = "Michael",
}: DustidWidgetProps) {
  const [stage, setStage] = useState<string>("banner");
  const [country, setCountry] = useState<string>("KE");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [userName] = useState<string>(initialUserName);
  const [phoneError, setPhoneError] = useState<string>("");
  const otpRefs: MutableRefObject<Array<HTMLInputElement | null>> = useRef([]);

  const mockContacts: Contact[] = [
    {
      id: 1,
      name: "Amy Scholfield",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "17 May",
    },
    {
      id: 2,
      name: "David Ochieng",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "15 May",
    },
    {
      id: 3,
      name: "John Kamau",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "12 May",
    },
    {
      id: 4,
      name: "Mary Wanjiku",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "10 May",
    },
    {
      id: 5,
      name: "Sarah Kimani",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "8 May",
    },
  ];

  const countries = [
    { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪", digits: 9 },
    { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬", digits: 9 },
    { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿", digits: 9 },
    { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼", digits: 9 },
    {
      code: "GB",
      name: "United Kingdom",
      dialCode: "+44",
      flag: "🇬🇧",
      digits: 10,
    },
    {
      code: "US",
      name: "United States",
      dialCode: "+1",
      flag: "🇺🇸",
      digits: 10,
    },
  ];

  const validatePhoneNumber = (number: string) => {
    const selectedCountry = countries.find((c) => c.code === country);
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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== "" && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSignup = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (validatePhoneNumber(phoneNumber)) {
      setStage("otp");
    }
  };

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.every((digit) => digit !== "")) {
      setStage("welcome");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      // Show first 3 contacts alphabetically when empty
      const sortedContacts = [...mockContacts]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 3);
      setFilteredContacts(sortedContacts);
      setShowDropdown(true);
    } else {
      const filtered = mockContacts.filter((contact) =>
        contact.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
      setShowDropdown(filtered.length > 0);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setSearchQuery("");
    setShowDropdown(false);
    setStage("contactSelected");
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() === "") {
      const sortedContacts = [...mockContacts]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 3);
      setFilteredContacts(sortedContacts);
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

  const getSelectedCountry = () => {
    return countries.find((c) => c.code === country);
  };

  const goBack = () => {
    if (stage === "signup") setStage("banner");
    else if (stage === "otp") setStage("signup");
  };

  const closeWidget = () => {
    setStage("banner");
    setPhoneNumber("");
    setOtp(["", "", "", "", "", ""]);
    setSearchQuery("");
    setSelectedContact(null);
    setShowDropdown(false);
    setPhoneError("");
  };

  return (
    <div className="dustid-widget">
      {stage === "banner" && (
        <div onClick={() => setStage("signup")} className="banner">
          <div className="banner-content">
            <span className="banner-text">
              Gifts for a friend? Click here to get powered by
            </span>
            <div className="dustid-logo">
              <div className="logo-icon">
                <span>D</span>
              </div>
              <span className="logo-text">DustID</span>
            </div>
          </div>
        </div>
      )}

      {stage === "signup" && (
        <div className="signup">
          {/* Large screen layout */}
          <div className="signup-desktop">
            <button onClick={goBack} className="icon-button">
              <ArrowLeft className="w-5 h-5" color="black" />
            </button>

            <h2 className="signup-title">Sign in</h2>

            <div className="desktop-inputs">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="country-select"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>

              <div className="phone-input-container">
                <span className="country-code">
                  {getSelectedCountry()?.dialCode}
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setPhoneError("");
                  }}
                  placeholder="Enter phone number"
                  className="phone-input"
                />
              </div>

              <button onClick={handleSignup} className="desktop-button">
                Sign in
              </button>
            </div>

            <button onClick={closeWidget} className="icon-button">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile layout */}
          <div className="signup-mobile">
            <div className="signup-header">
              <button onClick={goBack} className="icon-button">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <button onClick={closeWidget} className="icon-button">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSignup} className="signup-form">
              <div className="signup-form-fields">
                <h2 className="signup-title">Sign in</h2>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="country-select"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>

                <div className="phone-input-container">
                  <span className="country-code">
                    {getSelectedCountry()?.dialCode}
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setPhoneError("");
                    }}
                    placeholder="Enter phone number"
                    className="phone-input"
                  />
                </div>

                {phoneError && <p className="phone-error">{phoneError}</p>}
              </div>

              <button type="submit" className="signup-button">
                Sign in
              </button>
            </form>
          </div>
        </div>
      )}

      {stage === "otp" && (
        <div className="otp">
          <div className="otp-header">
            <button onClick={goBack} className="icon-button">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={closeWidget} className="icon-button">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="otp-message">
            <p>
              We've sent an SMS with a verification code to your phone at
              <span className="otp-phone">
                {getSelectedCountry()?.dialCode} {phoneNumber}
              </span>
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <div className="otp-inputs">
              {otp.map((digit, index) => (
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
                  className="otp-input"
                />
              ))}
            </div>

            <div className="otp-actions">
              <button type="submit" className="verify-button">
                Verify
              </button>

              {resendCountdown > 0 ? (
                <p className="resend-timer">Resend in {resendCountdown}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="resend-button"
                >
                  Resend
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {stage === "welcome" && (
        <div className="welcome">
          <div className="welcome-header">
            <h2 className="welcome-title">Welcome {userName}!</h2>
            <button onClick={closeWidget} className="icon-button">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleSearchFocus}
              className="search-input"
            />

            {showDropdown && filteredContacts.length > 0 && (
              <ul className="contacts-dropdown">
                {filteredContacts.map((contact) => (
                  <li
                    key={contact.id}
                    onClick={() => handleContactSelect(contact)}
                    className="contact-item"
                  >
                    <img
                      src={contact.avatar || "/placeholder.svg"}
                      alt={contact.name}
                      className="contact-avatar"
                    />
                    <span className="contact-name">{contact.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {stage === "contactSelected" && selectedContact && (
        <div className="contact-selected">
          <div className="welcome-header">
            <h2 className="welcome-title">Welcome {userName}!</h2>
            <button onClick={closeWidget} className="icon-button">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="contact-card">
            <img
              src={selectedContact.avatar || "/placeholder.svg"}
              alt={selectedContact.name}
              className="contact-avatar-large"
            />
            <div className="contact-info">
              <h3 className="contact-name-large">{selectedContact.name}</h3>
              <div className="contact-date">
                <Calendar className="w-4 h-4" />
                <span>{selectedContact.date}</span>
              </div>
            </div>
          </div>

          <div className="contact-actions">
            <button
              onClick={() => setStage("welcome")}
              className="change-button"
            >
              Change contact
            </button>
            <button
              onClick={() => setStage("shopping")}
              className="send-button"
            >
              Send to contact
            </button>
          </div>
        </div>
      )}

      {stage === "shopping" && selectedContact && (
        <div className="shopping">
          <div className="shopping-header">
            <div></div>
            <button onClick={closeWidget} className="icon-button">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={() => setStage("contactSelected")}
            className="shopping-card"
          >
            <img
              src={selectedContact.avatar || "/placeholder.svg"}
              alt={selectedContact.name}
              className="contact-avatar-large"
            />
            <div className="shopping-info">
              <p>You are currently shopping for</p>
              <h3>{selectedContact.name}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
