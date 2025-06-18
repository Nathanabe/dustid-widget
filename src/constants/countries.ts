import type { Country } from "../types";

export const COUNTRIES: Country[] = [
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪", digits: 9 },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬", digits: 9 },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿", digits: 9 },
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼", digits: 9 },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    digits: 10,
  },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", digits: 10 },
];
