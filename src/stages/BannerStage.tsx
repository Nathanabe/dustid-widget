"use client";

import type React from "react";
import type { StageProps } from "../types";
import { styles } from "../styles";

interface BannerStageProps extends StageProps {}

const BannerStage: React.FC<BannerStageProps> = ({ onNext }) => {
  return (
    <div
      style={{
        cursor: "pointer",
        ...styles.stage,
      }}
      onClick={onNext}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onNext?.();
        }
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "14px" }}>
          Gifts for a friend?{" "}
          <span style={{ color: "#2563eb" }}>Click here</span> to get powered by
        </p>
        <img src="https://dustid-widget-new.vercel.app/dustid.svg" />
      </div>
    </div>
  );
};

export default BannerStage;
