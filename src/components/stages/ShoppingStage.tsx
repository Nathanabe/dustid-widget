"use client";

import type React from "react";
import type { Contact } from "../../types";

interface ShoppingStageProps {
  selectedContact: Contact;
  onContactClick: () => void;
}

const ShoppingStage: React.FC<ShoppingStageProps> = ({
  selectedContact,
  onContactClick,
}) => {
  const containerStyle: React.CSSProperties = {
    padding: "8px",
    backgroundColor: "#e9d5ff",
    borderRadius: "8px",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  };

  const avatarButtonStyle: React.CSSProperties = {
    padding: "4px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const avatarStyle: React.CSSProperties = {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    objectFit: "cover",
    border: "1px solid #d1d5db",
  };

  const textStyle: React.CSSProperties = {
    fontSize: "12px",
  };

  const nameStyle: React.CSSProperties = {
    fontWeight: "bold",
  };

  // Responsive text size
  const isSmallScreen =
    typeof window !== "undefined" && window.innerWidth < 640;
  const responsiveTextStyle = {
    ...textStyle,
    fontSize: isSmallScreen ? "16px" : "12px",
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <button
          onClick={onContactClick}
          style={avatarButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f3f4f6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          aria-label={`View ${selectedContact.name} details`}
        >
          <img
            src={selectedContact.avatar || "/placeholder.svg"}
            alt={selectedContact.name}
            style={avatarStyle}
          />
        </button>

        <p style={responsiveTextStyle}>
          You are currently shopping for{" "}
          <span style={nameStyle}>{selectedContact.name}</span>
        </p>
      </div>
    </div>
  );
};

export default ShoppingStage;
