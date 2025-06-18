"use client";

import type React from "react";
import { X } from "lucide-react";
import type { Contact } from "../../types";
import ContactSearch from "../ContactSearch";

interface WelcomeStageProps {
  userName: string;
  onContactSelect: (contact: Contact) => void;
  onClose: () => void;
}

const WelcomeStage: React.FC<WelcomeStageProps> = ({
  userName,
  onContactSelect,
  onClose,
}) => {
  const containerStyle: React.CSSProperties = {
    padding: "16px 64px 8px 16px",
    backgroundColor: "#e9d5ff",
    borderRadius: "8px",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  };

  const leftSectionStyle: React.CSSProperties = {
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    marginBottom: "8px",
    fontSize: "16px",
    fontWeight: "bold",
  };

  const iconButtonStyle: React.CSSProperties = {
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  // Responsive adjustments
  const mobileContainerStyle: React.CSSProperties = {
    ...containerStyle,
    padding: "16px",
  };

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

  return (
    <div style={isDesktop ? containerStyle : mobileContainerStyle}>
      <div style={contentStyle}>
        <div style={leftSectionStyle}>
          <h2 style={titleStyle}>Welcome {userName}!</h2>
          <ContactSearch onContactSelect={onContactSelect} />
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
    </div>
  );
};

export default WelcomeStage;
