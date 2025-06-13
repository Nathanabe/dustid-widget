"use client";
import './widget.css'
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

  const handleSignup = (e: { preventDefault: () => void; }) => {
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
    <div className="w-full rounded-lg shadow-lg ">
      {stage === "banner" && (
        <div
          onClick={() => setStage("signup")}
          className="cursor-pointer p-2 bg-[#D5BEFF]"
        >
          <div className="flex items-center justify-center gap-4 text-center lg:text-left">
            <p className="text-[10px] lg:text-sm ">
              Gifts for a friend?{" "}
              <span className="text-[#2B84A4]">Click here</span> to get powered
              by
            </p>
            <img className="w-[5em]" src="./dustid.svg" />
          </div>
        </div>
      )}

      {stage === "signup" && (
        <div className="p-2 bg-[#D5BEFF]">
          {/* Large screen layout */}
          <div className="hidden lg:flex items-center justify-between gap-6">
            <button
              onClick={goBack}
              className="p-2 hover:bg-gray-100  rounded-full"
            >
              <ArrowLeft className="w-4 h-4  " color="black" />
            </button>

            <h2 className="text-sm font-semibold text-black">Sign in</h2>

            <div className="flex items-center gap-4 ">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="p-1.5 border-white block bg-white rounded-md focus:outline-none"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>

              <div className="flex">
                <span className="inline-flex items-center px-1.5 rounded-l-md bg-white text-sm border-r border-gray-200">
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
                  className="p-1.5 bg-white rounded-br-md rounded-tr-md focus:outline-none"
                />
              </div>

              <button
                onClick={handleSignup}
                className="bg-[#54358C]  text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Sign in
              </button>
            </div>

            <button
              onClick={closeWidget}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Mobile layout */}
          <div className="lg:hidden space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-100  rounded-full"
              >
                <ArrowLeft className="w-5 h-5 " />
              </button>
              <div>
                <button
                  onClick={closeWidget}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 " />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSignup}
              className="space-y-4 flex justify-between"
            >
              <div className=" w-[90%]">
                <h2 className="text-xl font-semibold text-gray-900">Sign in</h2>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md mb-2"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      <span className="inline-block border-r-2 border-r-black">
                        {c.flag}
                      </span>{" "}
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 rounded-l-md  text-sm bg-white">
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
                    className="flex-1 px-3 py-2  rounded-r-md bg-white border-l border-gray-400"
                  />
                </div>

                {phoneError && (
                  <p className="text-red-500 text-sm">{phoneError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-[40%] ml-3.5 h-[20%] relative bottom-[-4.7em] bg-[#54358C] cursor-pointer text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      )}

      {stage === "otp" && (
        <div className="p-2 bg-[#D5BEFF]">
          <div className="md:flex items-center justify-between">
            <button onClick={goBack} className="p-2  rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div></div>
            <p className="text-sm mb-2">
              We've sent an SMS with a verification code to your phone at{" "}
              <span className="font-semibold">
                {getSelectedCountry()?.dialCode} {phoneNumber}
              </span>
            </p>

            <form
              onSubmit={handleVerify}
              className="flex justify-between"
            >
              <div className="flex gap-1 justify-center mr-4">
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
                    className="w-6 h-8 text-center text-lg font-semibold  bg-white rounded-3xl focus:outline-none"
                  />
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  type="submit"
                  className="bg-[#54358C] text-white font-medium p-2 rounded-md transition-colors"
                >
                  Verify
                </button>

                {resendCountdown > 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 py-2">
                    Resend in {resendCountdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-blue-600 hover:text-blue-700 font-medium py-2 px-4 transition-colors"
                  >
                    Resend
                  </button>
                )}
              </div>
            </form>
            <button
              onClick={closeWidget}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full hidden md:visible"
            >
              <X className="w-5 h-5 " />
            </button>
          </div>
        </div>
      )}

      {stage === "welcome" && (
        <div className="p-4 md:py-2 md:px-[10em] bg-[#D5BEFF] ">
          <div className="w-full sm:w-[80%] m-auto flex items-center justify-between">
            <div className='w-full'>
              <h2 className=" mb-2 md:text-base font-bold ">Welcome {userName}!</h2>
              <div className="relative md:w-[50%]">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="w-full p-1 bg-white rounded-md"
                />

                {showDropdown && filteredContacts.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredContacts.map((contact) => (
                      <li
                        key={contact.id}
                        onClick={() => handleContactSelect(contact)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-150"
                      >
                        <img
                          src={contact.avatar || "/placeholder.svg"}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{contact.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              onClick={closeWidget}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {stage === "contactSelected" && selectedContact && (
        <div className="p-2 bg-[#D5BEFF]">
          <div className="items-center justify-between w-full m-auto sm:w-[50%] sm:flex">
            <h2 className="text-base font-bold mb-3">Welcome {userName}!</h2>

            <div className="flex border md:flex-row md:w-2/3 justify-between">
              <div className="flex items-center gap-4 p-2 bg-[#54358C] rounded-md w-[60%] ">
                <img
                  src={selectedContact.avatar || "/placeholder.svg"}
                  alt={selectedContact.name}
                  className="w-7 h-7 rounded-xl block object-cover"
                />
                <div className="flex justify-between ">
                  <h3 className="text-sm  text-amber-50">
                    {selectedContact.name}
                  </h3>
                  <div className="flex items-center text-amber-50 text-xs ml-2">
                    <Calendar className="w-2 h-2" />
                    <span className="ml-1">{selectedContact.date}</span>
                  </div>
                </div>
              </div>
              <div className="w-[38%]">
                <button
                  onClick={() => setStage("shopping")}
                  className=" bg-[#54358C] text-xs  text-white px-4 rounded-md transition-colors w-full py-1 mb-2"
                >
                  Send to contact
                </button>
                <button
                  onClick={() => setStage("welcome")}
                  className="flex border p-1 text-xs rounded-md transition-colors w-full px-7"
                >
                  Change contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === "shopping" && selectedContact && (
        <div className="p-2 bg-[#D5BEFF] ">
          <div className="flex items-center justify-between  m-auto place-content-center align-middle sm:w-[50%] ">
            <div onClick={() => setStage("contactSelected")} className="flex">
              <img
                src={selectedContact.avatar || "/placeholder.svg"}
                alt={selectedContact.name}
                className="w-7 h-7 rounded-md object-cover border"
              />

              <p className="text-xs ml-4 sm:text-base">
                You are currently shopping for{" "}
                <span className="font-bold "> {selectedContact.name}*</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
