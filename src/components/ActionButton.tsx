"use client";

import type React from "react";

interface ActionButtonProps {
  onClick: any
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  disabled = false,
  loading = false,
  style = {},
}) => {
  const baseStyle: React.CSSProperties = {
    fontWeight: "500",
    padding: "8px 16px",
    borderRadius: "6px",
    transition: "all 0.2s",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    border: "none",
    outline: "none",
    ...style,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: disabled || loading ? "#9ca3af" : "#7c3aed",
      color: "white",
    },
    secondary: {
      backgroundColor: disabled || loading ? "#f3f4f6" : "#f9fafb",
      color: disabled || loading ? "#9ca3af" : "#374151",
      border: "1px solid #d1d5db",
    },
    outline: {
      backgroundColor: "transparent",
      color: disabled || loading ? "#9ca3af" : "#7c3aed",
      border: `1px solid ${disabled || loading ? "#d1d5db" : "#7c3aed"}`,
    },
  };

  const buttonStyle = {
    ...baseStyle,
    ...variantStyles[variant],
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      if (variant === "primary") {
        e.currentTarget.style.backgroundColor = "#6d28d9";
      } else if (variant === "outline") {
        e.currentTarget.style.backgroundColor = "#f3f4f6";
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      if (variant === "primary") {
        e.currentTarget.style.backgroundColor = "#7c3aed";
      } else if (variant === "outline") {
        e.currentTarget.style.backgroundColor = "transparent";
      }
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default ActionButton;
