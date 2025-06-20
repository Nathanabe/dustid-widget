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



export default function DustidWidget({
  userName = "Michael",
}: DustidWidgetProps) {
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
    selectedContact: null as Contact | null,
  });

  const handleStageChange = (newStage: Stage) => {
    if (newStage === "otp") {
      setOtpData({
        ...otpData,
        phoneNumber: signupData.phoneNumber,
        countryCode: signupData.countryCode,
        resendCountdown: 30,
      });
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
    setWelcomeData({ userName, selectedContact: null });
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
