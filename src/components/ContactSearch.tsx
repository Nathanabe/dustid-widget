"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import type { Contact } from "../types";
import { apiService } from "../utils/api";


interface ContactSearchProps {
  onContactSelect: (contact: Contact) => void;
}

const ContactSearch: React.FC<ContactSearchProps> = ({ onContactSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    maxWidth: "384px",
  };

  const inputContainerStyle: React.CSSProperties = {
    position: "relative",
  };

  const searchIconStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    width: "16px",
    height: "16px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    paddingLeft: "40px",
    paddingRight: "16px",
    paddingTop: "8px",
    paddingBottom: "8px",
    backgroundColor: "white",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    outline: "none",
  };

  const dropdownStyle: React.CSSProperties = {
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
  };

  const contactItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const avatarStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  };

  const nameStyle: React.CSSProperties = {
    fontWeight: "500",
  };

  const loadingStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
  };

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
    setSearchQuery("");
    setShowDropdown(false);
    onContactSelect(contact);
  };

  const handleFocus = () => {
    if (searchQuery.trim() === "") {
      searchContacts("");
    }
  };

  // Handle click outside
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

  return (
    <div style={containerStyle} ref={dropdownRef}>
      <div style={inputContainerStyle}>
        <Search style={searchIconStyle} />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleFocus}
          style={inputStyle}
          aria-label="Search contacts"
        />
      </div>

      {showDropdown && (
        <div style={dropdownStyle}>
          {isLoading ? (
            <div style={loadingStyle}>Searching...</div>
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactSelect(contact)}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
                style={contactItemStyle}
                role="button"
                tabIndex={0}
              >
                <img
                  src={contact.avatar || "/placeholder.svg"}
                  alt={contact.name}
                  style={avatarStyle}
                />
                <span style={nameStyle}>{contact.name}</span>
              </div>
            ))
          ) : (
            <div style={loadingStyle}>No contacts found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactSearch;
