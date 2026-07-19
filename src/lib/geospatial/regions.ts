import type { RegionalData, RegionalIndicator } from "@/types/data";

export interface RegionConfig {
  id: string;
  name: string;
  country: string;
  state: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
  currency: string;
  language: string;
  economicProfile: EconomicProfile;
}

export interface EconomicProfile {
  gdpPerCapita: number;
  inflationRate: number;
  unemploymentRate: number;
  interestRate: number;
  easeOfDoingBusiness: number; // 1-190 ranking
  corruptionIndex: number; // 0-100
  digitalReadiness: number; // 0-100
  marketSize: "SMALL" | "MEDIUM" | "LARGE" | "MEGA";
  primaryIndustries: string[];
}

export const REGIONS: RegionConfig[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    country: "India",
    state: "Maharashtra",
    coordinates: { lat: 19.076, lng: 72.8777 },
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "Hindi/English",
    economicProfile: {
      gdpPerCapita: 21000,
      inflationRate: 6.5,
      unemploymentRate: 5.2,
      interestRate: 6.5,
      easeOfDoingBusiness: 63,
      corruptionIndex: 40,
      digitalReadiness: 72,
      marketSize: "MEGA",
      primaryIndustries: ["Finance", "Technology", "Entertainment", "Manufacturing"],
    },
  },
  {
    id: "delhi",
    name: "New Delhi",
    country: "India",
    state: "Delhi",
    coordinates: { lat: 28.6139, lng: 77.209 },
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "Hindi/English",
    economicProfile: {
      gdpPerCapita: 18000,
      inflationRate: 6.2,
      unemploymentRate: 4.8,
      interestRate: 6.5,
      easeOfDoingBusiness: 70,
      corruptionIndex: 38,
      digitalReadiness: 68,
      marketSize: "MEGA",
      primaryIndustries: ["Government", "Technology", "Real Estate", "Retail"],
    },
  },
  {
    id: "bangalore",
    name: "Bangalore",
    country: "India",
    state: "Karnataka",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "Kannada/English",
    economicProfile: {
      gdpPerCapita: 22000,
      inflationRate: 5.8,
      unemploymentRate: 3.5,
      interestRate: 6.5,
      easeOfDoingBusiness: 55,
      corruptionIndex: 42,
      digitalReadiness: 80,
      marketSize: "LARGE",
      primaryIndustries: ["Technology", "Biotech", "Aerospace", "Education"],
    },
  },
  {
    id: "ambikapur",
    name: "Ambikapur",
    country: "India",
    state: "Chhattisgarh",
    coordinates: { lat: 23.1191, lng: 83.1979 },
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "Hindi",
    economicProfile: {
      gdpPerCapita: 8500,
      inflationRate: 7.0,
      unemploymentRate: 8.5,
      interestRate: 6.5,
      easeOfDoingBusiness: 130,
      corruptionIndex: 35,
      digitalReadiness: 35,
      marketSize: "SMALL",
      primaryIndustries: ["Agriculture", "Mining", "Handicrafts", "Small Manufacturing"],
    },
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    state: "Dubai",
    coordinates: { lat: 25.2048, lng: 55.2708 },
    timezone: "Asia/Dubai",
    currency: "AED",
    language: "Arabic/English",
    economicProfile: {
      gdpPerCapita: 43000,
      inflationRate: 3.2,
      unemploymentRate: 2.1,
      interestRate: 4.4,
      easeOfDoingBusiness: 16,
      corruptionIndex: 68,
      digitalReadiness: 88,
      marketSize: "MEDIUM",
      primaryIndustries: ["Real Estate", "Tourism", "Finance", "Logistics", "Technology"],
    },
  },
  {
    id: "abu_dhabi",
    name: "Abu Dhabi",
    country: "UAE",
    state: "Abu Dhabi",
    coordinates: { lat: 24.4539, lng: 54.3773 },
    timezone: "Asia/Dubai",
    currency: "AED",
    language: "Arabic/English",
    economicProfile: {
      gdpPerCapita: 50000,
      inflationRate: 2.8,
      unemploymentRate: 1.8,
      interestRate: 4.4,
      easeOfDoingBusiness: 18,
      corruptionIndex: 70,
      digitalReadiness: 85,
      marketSize: "MEDIUM",
      primaryIndustries: ["Oil & Gas", "Finance", "Tourism", "Technology"],
    },
  },
  {
    id: "new_york",
    name: "New York",
    country: "USA",
    state: "New York",
    coordinates: { lat: 40.7128, lng: -74.006 },
    timezone: "America/New_York",
    currency: "USD",
    language: "English",
    economicProfile: {
      gdpPerCapita: 85000,
      inflationRate: 3.4,
      unemploymentRate: 3.8,
      interestRate: 5.5,
      easeOfDoingBusiness: 6,
      corruptionIndex: 69,
      digitalReadiness: 92,
      marketSize: "MEGA",
      primaryIndustries: ["Finance", "Technology", "Healthcare", "Media", "Real Estate"],
    },
  },
  {
    id: "san_francisco",
    name: "San Francisco",
    country: "USA",
    state: "California",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    timezone: "America/Los_Angeles",
    currency: "USD",
    language: "English",
    economicProfile: {
      gdpPerCapita: 95000,
      inflationRate: 3.6,
      unemploymentRate: 3.2,
      interestRate: 5.5,
      easeOfDoingBusiness: 5,
      corruptionIndex: 72,
      digitalReadiness: 96,
      marketSize: "LARGE",
      primaryIndustries: ["Technology", "Finance", "Biotech", "Clean Energy"],
    },
  },
  {
    id: "london",
    name: "London",
    country: "UK",
    state: "England",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    timezone: "Europe/London",
    currency: "GBP",
    language: "English",
    economicProfile: {
      gdpPerCapita: 55000,
      inflationRate: 4.0,
      unemploymentRate: 4.2,
      interestRate: 5.25,
      easeOfDoingBusiness: 8,
      corruptionIndex: 71,
      digitalReadiness: 90,
      marketSize: "LARGE",
      primaryIndustries: ["Finance", "Professional Services", "Technology", "Creative Industries"],
    },
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    state: "Central",
    coordinates: { lat: 1.3521, lng: 103.8198 },
    timezone: "Asia/Singapore",
    currency: "SGD",
    language: "English/Malay/Mandarin",
    economicProfile: {
      gdpPerCapita: 65000,
      inflationRate: 2.8,
      unemploymentRate: 2.0,
      interestRate: 3.8,
      easeOfDoingBusiness: 2,
      corruptionIndex: 85,
      digitalReadiness: 95,
      marketSize: "SMALL",
      primaryIndustries: ["Finance", "Technology", "Biomedical", "Logistics", "Manufacturing"],
    },
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    state: "Tokyo",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    timezone: "Asia/Tokyo",
    currency: "JPY",
    language: "Japanese",
    economicProfile: {
      gdpPerCapita: 48000,
      inflationRate: 3.2,
      unemploymentRate: 2.5,
      interestRate: 0.25,
      easeOfDoingBusiness: 29,
      corruptionIndex: 73,
      digitalReadiness: 88,
      marketSize: "MEGA",
      primaryIndustries: ["Technology", "Automotive", "Electronics", "Finance"],
    },
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Germany",
    state: "Berlin",
    coordinates: { lat: 52.52, lng: 13.405 },
    timezone: "Europe/Berlin",
    currency: "EUR",
    language: "German/English",
    economicProfile: {
      gdpPerCapita: 45000,
      inflationRate: 2.9,
      unemploymentRate: 5.8,
      interestRate: 4.5,
      easeOfDoingBusiness: 22,
      corruptionIndex: 78,
      digitalReadiness: 82,
      marketSize: "LARGE",
      primaryIndustries: ["Technology", "Automotive", "Manufacturing", "Green Energy"],
    },
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    state: "New South Wales",
    coordinates: { lat: -33.8688, lng: 151.2093 },
    timezone: "Australia/Sydney",
    currency: "AUD",
    language: "English",
    economicProfile: {
      gdpPerCapita: 58000,
      inflationRate: 4.1,
      unemploymentRate: 3.7,
      interestRate: 4.35,
      easeOfDoingBusiness: 14,
      corruptionIndex: 77,
      digitalReadiness: 86,
      marketSize: "MEDIUM",
      primaryIndustries: ["Finance", "Mining", "Technology", "Healthcare"],
    },
  },
  {
    id: "toronto",
    name: "Toronto",
    country: "Canada",
    state: "Ontario",
    coordinates: { lat: 43.6532, lng: -79.3832 },
    timezone: "America/Toronto",
    currency: "CAD",
    language: "English/French",
    economicProfile: {
      gdpPerCapita: 52000,
      inflationRate: 3.4,
      unemploymentRate: 5.8,
      interestRate: 5.0,
      easeOfDoingBusiness: 23,
      corruptionIndex: 74,
      digitalReadiness: 84,
      marketSize: "MEDIUM",
      primaryIndustries: ["Finance", "Technology", "Healthcare", "Film"],
    },
  },
];

export function getRegionById(id: string): RegionConfig | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function getUniqueCountries(): string[] {
  return [...new Set(REGIONS.map((r) => r.country))].sort();
}

export function getStatesForCountry(country: string): string[] {
  return [...new Set(REGIONS.filter((r) => r.country === country).map((r) => r.state))].sort();
}

export function getCitiesForState(country: string, state: string): RegionConfig[] {
  return REGIONS.filter((r) => r.country === country && r.state === state);
}

export function getRegionsByCountry(country: string): RegionConfig[] {
  return REGIONS.filter(
    (r) => r.country.toLowerCase() === country.toLowerCase()
  );
}

export function getRegionalAdjustments(regionId: string) {
  const region = getRegionById(regionId);
  if (!region) return null;

  const profile = region.economicProfile;

  return {
    inflationMultiplier: profile.inflationRate / 3.0,
    interestRateMultiplier: profile.interestRate / 5.0,
    salaryAdjustment: profile.gdpPerCapita / 40000,
    rentMultiplier: region.economicProfile.marketSize === "MEGA" ? 2.5 : region.economicProfile.marketSize === "LARGE" ? 1.8 : region.economicProfile.marketSize === "MEDIUM" ? 1.2 : 0.8,
    taxConsiderations: getTaxConsiderations(region),
    regulatoryComplexity: (100 - profile.easeOfDoingBusiness) / 100,
    digitalCapability: profile.digitalReadiness / 100,
  };
}

function getTaxConsiderations(region: RegionConfig): string[] {
  const considerations: string[] = [];

  if (region.country === "UAE") {
    considerations.push("No personal income tax", "9% corporate tax (above AED 375K)", "VAT at 5%");
  } else if (region.country === "India") {
    considerations.push("GST at 5-28%", "Corporate tax 25-30%", "TDS requirements");
  } else if (region.country === "USA") {
    considerations.push("Federal + State tax", "Corporate tax 21%+", "Sales tax varies by state");
  } else if (region.country === "UK") {
    considerations.push("VAT at 20%", "Corporation tax 25%", "PAYE for employees");
  } else if (region.country === "Singapore") {
    considerations.push("No capital gains tax", "Corporate tax 17%", "GST at 9%");
  }

  return considerations;
}

export async function getRegionData(regionId: string): Promise<RegionalData | null> {
  const region = getRegionById(regionId);
  if (!region) return null;

  const indicators: RegionalIndicator[] = [
    {
      name: "GDP Per Capita",
      value: region.economicProfile.gdpPerCapita,
      unit: region.currency,
      change: 2.5,
      period: "2024",
      source: "economic_profile",
    },
    {
      name: "Inflation Rate",
      value: region.economicProfile.inflationRate,
      unit: "%",
      change: -0.3,
      period: "2024",
      source: "economic_profile",
    },
    {
      name: "Unemployment Rate",
      value: region.economicProfile.unemploymentRate,
      unit: "%",
      change: -0.1,
      period: "2024",
      source: "economic_profile",
    },
    {
      name: "Ease of Doing Business",
      value: region.economicProfile.easeOfDoingBusiness,
      unit: "rank",
      change: 2,
      period: "2024",
      source: "world_bank",
    },
    {
      name: "Digital Readiness",
      value: region.economicProfile.digitalReadiness,
      unit: "score",
      change: 3.5,
      period: "2024",
      source: "computed",
    },
  ];

  return {
    region: region.name,
    country: region.country,
    coordinates: region.coordinates,
    indicators,
    lastUpdated: new Date(),
  };
}
