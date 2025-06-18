import type { Contact } from "../types"

export const apiService = {
  async sendOTP(phoneNumber: string, countryCode: string): Promise<{ success: boolean; message: string }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error("Failed to send OTP. Please try again.")
    }

    // Log the parameters for debugging (remove unused parameter warnings)
    console.log(`Sending OTP to ${phoneNumber} in ${countryCode}`)

    return {
      success: true,
      message: "OTP sent successfully",
    }
  },

  async verifyOTP(otp: string): Promise<{ success: boolean; token?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700))

    if (otp.length === 6) {
      return {
        success: true,
        token: "mock-jwt-token-" + Date.now(),
      }
    }

    throw new Error("Invalid OTP code")
  },

  async searchContacts(query: string): Promise<Contact[]> {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    const mockContacts: Contact[] = [
      {
        id: 1,
        name: "Amy Scholfield",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=40&h=40&fit=crop&crop=face",
        date: "17 May",
      },
      {
        id: 2,
        name: "David Ochieng",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        date: "15 May",
      },
      {
        id: 3,
        name: "John Kamau",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
        date: "12 May",
      },
      {
        id: 4,
        name: "Mary Wanjiku",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        date: "10 May",
      },
      {
        id: 5,
        name: "Sarah Kimani",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
        date: "8 May",
      },
    ]

    if (!query.trim()) {
      return mockContacts.slice(0, 3)
    }

    return mockContacts.filter((contact) => contact.name.toLowerCase().includes(query.toLowerCase()))
  },
}
