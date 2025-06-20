"use client";

import type React from "react";
import type { StageProps, Contact } from "../types";
import { styles } from "../styles";
import { useResponsive } from "../utils/responsive";


interface ShoppingStageProps extends StageProps {
  data: {
    selectedContact: Contact;
  };
}

const ShoppingStage: React.FC<ShoppingStageProps> = ({ onBack, data }) => {
  const { isMobile } = useResponsive();

  return (
    <div style={styles.stage}>
      <div
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          cursor: "pointer",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "4px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "transparent",

            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f3f4f6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <img
            src={
              data.selectedContact.avatar ||
              "/placeholder.svg?height=28&width=28"
            }
            alt={data.selectedContact.name}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              objectFit: "cover",
              border: "1px solid white",
            }}
          />
        </button>

        <p style={{ fontSize: isMobile ? "14px" : "12px" }}>
          You are currently shopping for{" "}
          <span style={{ fontWeight: "bold" }}>
            {data.selectedContact.name}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ShoppingStage;
