"use client";

import { useState } from "react";
import type { Stage, Contact, DustidWidgetProps } from "./types";

import ContactSelectedStage from "./stages/ContactSelectedStage";
import OTPStage from "./stages/OTPStage";
import ShoppingStage from "./stages/ShoppingStage";
import SignupStage from "./stages/SignupStage";
import WelcomeStage from "./stages/WelcomeStage";
import { styles } from "./styles";
import BannerStage from "./stages/BannerStage";

import { apiService } from "./utils/api";
import { COUNTRIES } from "./constants/countries";

export default function DustidWidget({
  userName = "Michael", //Default name, to be replaced by actual user data
}: DustidWidgetProps) {
  // build full phone number then:
  const [stage, setStage] = useState<Stage>("banner");
  const [signupData, setSignupData] = useState({
    phoneNumber: "",
    countryCode: "KE",
    phoneError: "",
  });
  const [otpData, setOtpData] = useState({
    phoneNumber: "",
    countryCode: "KE",
    otp: Array(6).fill(""),
    resendCountdown: 30,
  });
  const [welcomeData, setWelcomeData] = useState({
    userName,
    phoneNumber: "",
    selectedContact: null as Contact | null,
  });

  const handleStageChange = async (newStage: Stage) => {
    if (newStage === "otp") {
      setOtpData({
        ...otpData,
        phoneNumber: signupData.phoneNumber,
        countryCode: signupData.countryCode,
        resendCountdown: 30,
      });
    }

    //Welcome stage
    if (newStage === "welcome") {
      // Build canonical full phone number (dial code + cleaned number)
      const country = COUNTRIES.find((c) => c.code === otpData.countryCode) || COUNTRIES.find((c) => c.code === signupData.countryCode);
      const dial = country?.dialCode?.replace(/\D/g, "") || "";
      const raw = (otpData.phoneNumber || signupData.phoneNumber || "").replace(/\D/g, "");
      const fullPhone = raw.startsWith(dial) || !dial ? raw : `${dial}${raw}`;

      try {
        const profile = await apiService.getProfile(fullPhone);
        const name = profile?.name || profile?.fullName || userName;
        const firstName = name ? String(name).split(" ")[0] : userName;
        setWelcomeData({ userName: firstName, phoneNumber: fullPhone, selectedContact: null });
      } catch (err) {
        // fallback if profile not found
        setWelcomeData({ userName, phoneNumber: fullPhone, selectedContact: null });
      }
    }
    setStage(newStage);
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
    setSignupData({ phoneNumber: "", countryCode: "KE", phoneError: "" });
    setOtpData({
      phoneNumber: "",
      countryCode: "KE",
      otp: Array(6).fill(""),
      resendCountdown: 30,
    });
    setWelcomeData({ userName, phoneNumber: "", selectedContact: null });
  };

  return (
    <div style={styles.container}>
      {stage === "banner" && (
        <BannerStage onNext={() => handleStageChange("signup")} />
      )}

      {stage === "signup" && (
        <SignupStage
          onNext={() => handleStageChange("otp")}
          onBack={goBack}
          onClose={closeWidget}
          data={signupData}
          onDataChange={setSignupData}
        />
      )}

      {stage === "otp" && (
        <OTPStage
          onNext={() => handleStageChange("welcome")}
          onBack={goBack}
          onClose={closeWidget}
          data={otpData}
          onDataChange={setOtpData}
        />
      )}

      {stage === "welcome" && (
        <WelcomeStage
          onNext={() => handleStageChange("contactSelected")}
          onClose={closeWidget}
          data={welcomeData}
          onDataChange={setWelcomeData}
        />
      )}

      {stage === "contactSelected" && welcomeData.selectedContact && (
        <ContactSelectedStage
          onNext={() => handleStageChange("shopping")}
          onBack={goBack}
          data={{
            userName: welcomeData.userName,
            selectedContact: welcomeData.selectedContact,
          }}
        />
      )}

      {stage === "shopping" && welcomeData.selectedContact && (
        <ShoppingStage
          onBack={goBack}
          data={{
            selectedContact: welcomeData.selectedContact,
          }}
        />
      )}
    </div>
  );
}
