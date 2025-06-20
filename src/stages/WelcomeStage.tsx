"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { X, Search, Calendar } from "lucide-react";
import type { StageProps, Contact } from "../types";
import { styles } from "../styles";
import { apiService } from "../utils/api";
import { useResponsive } from "../utils/responsive";

interface WelcomeStageProps extends StageProps {
  data: {
    userName: string;
    selectedContact: Contact | null;
  };
}

const WelcomeStage: React.FC<WelcomeStageProps> = ({
  onNext,
  onClose,
  data,
  onDataChange,
}) => {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchContacts = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await apiService.searchContacts(query);
      setContacts(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error("Failed to search contacts:", error);
      setContacts([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchContacts(query);
  };

  const handleContactSelect = (contact: Contact) => {
    onDataChange?.({ ...data, selectedContact: contact });
    setSearchQuery("");
    setShowDropdown(false);
    onNext?.();
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() === "") {
      searchContacts("");
    }
  };

  const searchComponent = (
    <div
      style={{ position: "relative", width: "100%" }}
      ref={dropdownRef}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          backgroundColor: "white",
          borderRadius: "6px",
          alignItems: "center",
          padding: ".5em",
        }}
      >
        <Search
          style={{
            color: "#9ca3af",
            width: "24px",
            height: "24px",
          }}
        />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleSearchFocus}
          style={{
            width: "100%",
            paddingLeft: "40px",
            paddingRight: "16px",
            paddingTop: "8px",
            paddingBottom: "8px",
            backgroundColor: "white",
            border: "none",
            outline: "none",
            padding: ".6em",
          }}
        />
      </div>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            width: "100%",
            marginTop: "4px",
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            maxHeight: "240px",
            overflowY: "auto",
            // border: "1px solid red",
          }}
        >
          {isLoading ? (
            <div
              style={{
                padding: "12px 16px",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Searching...
            </div>
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactSelect(contact)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <img
                  src={contact.avatar || "/placeholder.svg?height=40&width=40"}
                  alt={contact.name}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    objectFit: "cover",
                  }}
                />
                <section>
                  <p style={{ fontSize: "13px", color: "#262626" }}>
                    {contact.name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "12px",
                      color: "#c4b5fd",
                    }}
                  >
                    <Calendar
                      style={{
                        width: "8px",
                        height: "8px",
                        marginRight: "4px",
                      }}
                    />
                    <span>{"17 May"}</span>
                  </div>
                </section>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "12px 16px",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              No contacts found
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ ...styles.stage, padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>
            Welcome {data.userName}!
          </h2>
          <button onClick={onClose} style={styles.iconButton}>
            <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
          </button>
        </div>
        {searchComponent}
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.stage,
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // width: "70%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          
            width: "60%",
            margin: "auto",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              width: "50%",
            }}
          >
            Welcome {data.userName}!
          </h2>
          {searchComponent}
        </div>

        <button onClick={onClose} style={styles.iconButton}>
          <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        </button>
      </div>
    </div>
  );
};

export default WelcomeStage;
