"use client";

import type React from "react";

interface BannerProps {
  onSignupClick: () => void;
}

const Banner: React.FC<BannerProps> = ({ onSignupClick }) => {
  const bannerStyle: React.CSSProperties = {
    cursor: "pointer",
    padding: "8px",
    backgroundColor: "#e9d5ff",
    borderRadius: "8px",
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    textAlign: "center",
  };

  const textStyle: React.CSSProperties = {
    fontSize: "14px",
  };

  const linkStyle: React.CSSProperties = {
    color: "#2563eb",
  };

  // const badgeStyle: React.CSSProperties = {
  //   backgroundColor: "#7c3aed",
  //   color: "white",
  //   padding: "4px 12px",
  //   borderRadius: "4px",
  //   fontSize: "12px",
  //   fontWeight: "bold",
  // };

  return (
    <div
      style={bannerStyle}
      onClick={onSignupClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSignupClick();
        }
      }}
    >
      <div style={containerStyle}>
        <p style={textStyle}>
          Gifts for a friend? <span style={linkStyle}>Click here</span> to get
          powered by
        </p>
        <img className="w-[5em]" src="./dustid.svg" />
      </div>
    </div>
  );
};

export default Banner;
