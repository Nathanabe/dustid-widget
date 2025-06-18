"use client";

import type React from "react";
import type { Country } from "../types";

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: string;
  onCountryChange: (countryCode: string) => void;
  style?: React.CSSProperties;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  countries,
  selectedCountry,
  onCountryChange,
  style = {},
}) => {
  const selectStyle: React.CSSProperties = {
    padding: "6px 12px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    borderRadius: "6px",
    outline: "none",
    ...style,
  };

  return (
    <select
      value={selectedCountry}
      onChange={(e) => onCountryChange(e.target.value)}
      style={selectStyle}
      aria-label="Select country"
    >
      {countries.map((country) => (
        <option key={country.code} value={country.code}>
          {country.flag} {country.name}
        </option>
      ))}
    </select>
  );
};

export default CountrySelector;
