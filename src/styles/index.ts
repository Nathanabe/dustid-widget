import type React from "react";
export const styles = {
  container: {
    width: "100%",
    borderRadius: "8px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,

  stage: {
    padding: "1em",
    backgroundColor: "#e9d5ff",
    borderRadius: "8px",
    border: "2px solid red",
  } as React.CSSProperties,

  iconButton: {
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,

  button: (
    variant: "primary" | "outline" = "primary",
    loading = false
  ): React.CSSProperties => ({
    fontWeight: "500",
    padding: "8px 16px",
    borderRadius: "3px",
    transition: "all 0.2s",
    cursor: loading ? "not-allowed" : "pointer",
    border: "none",
      outline: "none",
    width:"100%",
    backgroundColor:
      variant === "primary" ? (loading ? "#9ca3af" : "#7c3aed") : "transparent",
    color: variant === "primary" ? "white" : "#7c3aed",
    ...(variant === "outline" && { border: "1px solid #7c3aed" }),
  }),

  input: {
    padding: "6px 12px",
    backgroundColor: "white",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    outline: "none",
  } as React.CSSProperties,

  select: {
    padding: "6px 12px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    borderRadius: "6px",
    outline: "none",
  } as React.CSSProperties,

  error: {
    color: "#ef4444",
    fontSize: "12px",
  } as React.CSSProperties,
};
