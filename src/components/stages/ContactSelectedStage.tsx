"use client";

import type React from "react";
import { Calendar } from "lucide-react";
import type { Contact } from "../../types";
import ActionButton from "../ActionButton";

interface ContactSelectedStageProps {
  userName: string;
  selectedContact: Contact;
  onSendToContact: () => void;
  onChangeContact: () => void;
}

const ContactSelectedStage: React.FC<ContactSelectedStageProps> = ({
  userName,
  selectedContact,
  onSendToContact,
  onChangeContact,
}) => {
  const containerStyle: React.CSSProperties = {
    padding: "8px",
    backgroundColor: "#e9d5ff",
    borderRadius: "8px",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "bold",
  };

  const centerSectionStyle: React.CSSProperties = {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  };

  const contactCardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "8px",
    backgroundColor: "#7c3aed",
    borderRadius: "6px",
    color: "white",
    minWidth: 0,
    flex: 1,
    maxWidth: "300px",
  };

  const avatarStyle: React.CSSProperties = {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    objectFit: "cover",
    flexShrink: 0,
  };

  const contactInfoStyle: React.CSSProperties = {
    minWidth: 0,
    flex: 1,
  };

  const contactNameStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "500",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const contactDateStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    color: "#c4b5fd",
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const buttonStyle: React.CSSProperties = {
    fontSize: "12px",
    padding: "4px 16px",
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h2 style={titleStyle}>Welcome {userName}!</h2>

        <div style={centerSectionStyle}>
          <div style={contactCardStyle}>
            <img
              src={selectedContact.avatar || "/placeholder.svg"}
              alt={selectedContact.name}
              style={avatarStyle}
            />
            <div style={contactInfoStyle}>
              <h3 style={contactNameStyle}>{selectedContact.name}</h3>
              <div style={contactDateStyle}>
                <Calendar
                  style={{ width: "8px", height: "8px", marginRight: "4px" }}
                />
                <span>{selectedContact.date}</span>
              </div>
            </div>
          </div>

          <div style={actionsStyle}>
            <ActionButton onClick={onSendToContact} style={buttonStyle}>
              Send to contact
            </ActionButton>
            <ActionButton
              onClick={onChangeContact}
              variant="outline"
              style={buttonStyle}
            >
              Change contact
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSelectedStage;
