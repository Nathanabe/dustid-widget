import type { Contact } from "../types"
import { COUNTRIES } from "../constants/countries";

// Define the base URL for the API from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// helper function to simplify delay
function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// helper function to add timeout to fetch (using AbortController)
async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}) {
  const signal = (AbortSignal as any).timeout
    ? AbortSignal.timeout(5000)
    : new AbortController().signal; // fallback needed

  const response = await fetch(input, { ...init, signal });
  return response;
}

// Helper function for session token retrieval
function getAuthHeaders() {
  try {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export const apiService = {
  async sendOTP(phoneNumber: string, countryCode: string): Promise<{ success: boolean; message: string }> {
    // build numeric full phone: remove non-digits, prefix with country dial if needed
    const clean = (phoneNumber || "").replace(/\D/g, "");
    let fullPhone = clean;

    if (countryCode) {
      const country = COUNTRIES.find((c) => c.code === countryCode);
      const dial = country?.dialCode?.replace(/\D/g, "") || "";
      if (dial && !fullPhone.startsWith(dial)) {
        fullPhone = `${dial}${fullPhone}`;
      }
    }

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        // Check if the response status is 2xx
        return {
          success: true,
          message: data.message || "OTP is sent. Please check your SMS." 
        };
      } else {
        // Handle HTTP errors (e.g., 400, 404, 500)
        return {
          success: false,
          message: data.message || "Phone number not found. Please sign up first.",
        };
      }
    } catch (error) {
      // Handle network errors (e.g., server unreachable)
      console.error("Error verifying contact:", error);
      return {
        success: false,
        message:
          "Failed to connect to the verification service. Please try again later.",
      };
    }
  },

  async verifyOTP(otp: string, phoneNumber?: string): Promise<{ success: boolean; token?: string }> {
    await delay(800 + Math.random() * 700);

    // DEV shortcut (use only when back-end is turned off)
    /*
    if (otp.length === 6) {
      return {
        success: true,
        token: "mock-jwt-token-" + Date.now(),
      }
    }

    throw new Error("Invalid OTP code")
    */

    // call backend validate endpoint
    try {
      const authHeaders = (getAuthHeaders() ?? {}) as Record<string, string>;
      const resp = await fetchWithTimeout(`${API_BASE_URL}/validate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ phoneNumber, otp }),
        credentials: 'include'
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ message: "Invalid OTP" }));
        throw new Error(err.message || "OTP validation failed");
      }
      const json = await resp.json();
      const token = json.token || ("server-token-" + Date.now());
      try { localStorage.setItem("authToken", token); } catch {}
      return { success: true, token };
    } catch (err) { throw err; }
  },

  async searchContacts(phoneNumber: string | undefined, query: string): Promise<Contact[]> {
    await delay(300 + Math.random() * 200);

    try {
      const authHeaders = (getAuthHeaders() ?? {}) as Record<string, string>;
      const resp = await fetchWithTimeout(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ phoneNumber, query }),
        credentials: 'include'
      });
      if (!resp.ok) return [];
      const json = await resp.json();
      const results = json.results || [];
      return results.map((r:any, i:number) => ({
        id: typeof r.id === 'number' ? r.id : i+1,
        name: r.name || r.first_name || r.email || "",
        avatar: r.avatar || "",
        date: r.date,
      }));
    } catch (err) {
      console.error("searchContacts error:", err);
      return [];
    }
  },

  async getProfile(phoneNumber: string): Promise<any> {
    try {
      const authHeaders = (getAuthHeaders() ?? {}) as Record<string, string>;
      const resp = await fetchWithTimeout(`${API_BASE_URL}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ phoneNumber }),
        credentials: 'include'
      });
      if (!resp.ok) throw new Error("Profile not found");
      const json = await resp.json();
      return json.contact || json;
    } catch (err) {
      console.error("getProfile error:", err);
      throw err;
    }
  },
}

