"use client";

import type React from "react";
import { Calendar } from "lucide-react";
import type { StageProps, Contact } from "../types";
import  { styles } from "../styles";
import { useResponsive } from "../utils/responsive";

interface ContactSelectedStageProps extends StageProps {
  data: {
    userName: string;
    selectedContact: Contact;
  };
}

const ContactSelectedStage: React.FC<ContactSelectedStageProps> = ({
  onNext,
  onBack,
  data,
}) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div style={styles.stage}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "16px",
            textAlign: "left",
          }}
        >
          Welcome {data.userName}!
        </h2>

        <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px",
              backgroundColor: "#54358C",
              borderRadius: "6px",
              color: "white",
              flex: 1,
            }}
          >
            <img
              src={
                data.selectedContact.avatar ||
                "/placeholder.svg?height=28&width=28"
              }
              alt={data.selectedContact.name}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {data.selectedContact.name}
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "white",
                }}
              >
                <Calendar
                  style={{ width: "8px", height: "8px", marginRight: "4px" }}
                />
                <span>{data.selectedContact.date}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              flex: 1,
            }}
          >
            <button
              onClick={onBack}
              style={{
                ...styles.button("outline"),
                fontSize: "12px",
                padding: "6px 8px",
                height: "50%",
                border: "1px solid black",
                borderRadius: "6px",
              }}
            >
              Change contact
            </button>
            <button
              onClick={onNext}
              style={{
                ...styles.button("primary"),
                fontSize: "12px",
                padding: "6px 8px",
                height: "50%",
                backgroundColor: "#54358C",
                borderRadius: "6px",
              }}
            >
              Send to contact
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.stage}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          width: "80%",
          margin: "auto",
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>
          Welcome {data.userName}!
        </h2>

        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",

            width: "80%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              backgroundColor: "#7c3aed",
              borderRadius: "6px",
              color: "white",
              padding: "10px 16px",
              width: "70%",
            }}
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
                borderRadius: "8px",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "80%",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: "500" }}>
                {data.selectedContact.name}
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "#c4b5fd",
                }}
              >
                <Calendar
                  style={{ width: "8px", height: "8px", marginRight: "4px" }}
                />
                <span>{data.selectedContact.date}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onNext}
            style={{
              ...styles.button("primary"),
              fontSize: "12px",
              padding: "10px 16px",
              borderRadius: "8px",
              color: "black",
              width: "40%",
            }}
          >
            Send to contact
          </button>

          <button
            onClick={onBack}
            style={{
              ...styles.button("outline"),
              fontSize: "12px",
              padding: "10px 16px",
              width: "40%",
              color: "black",
              borderRadius: "8px",
              border: "1px solid ",
            }}
          >
            Change contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSelectedStage;
