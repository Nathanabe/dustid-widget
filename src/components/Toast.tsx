import React, { createContext, useContext, useState, useCallback } from "react";

// A simple toast notification system using React Context.
// The `useToast` hook can be called from any component within the `ToastProvider` to show a toast message.
// The toast will automatically disappear after a specified duration (default 5 seconds).
type ToastFn = (msg: string, ms?: number) => void;
const ToastContext = createContext<ToastFn | null>(null);

export const useToast = () => {
  const fn = useContext(ToastContext);
  if (!fn) throw new Error("useToast must be used within ToastProvider");
  return fn;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string, ms = 5000) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div style={{
          position: "fixed",
          top: "45%",
          left: "45%",
          transform: "translateX(-50%)",
          background: "rgba(220,38,38,0.9)",
          color: "white",
          padding: "8px 14px",
          borderRadius: 6,
          zIndex: 9999,
          pointerEvents: "none",
          fontFamily: "system-ui, -apple-system, sans-serif", //match app font
        }}>
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
};