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
  easeOfDoingBusiness: number;
  corruptionIndex: number;
  digitalReadiness: number;
  marketSize: "SMALL" | "MEDIUM" | "LARGE" | "MEGA";
  primaryIndustries: string[];
}

function r(name: string, country: string, state: string, lat: number, lng: number, tz: string, cur: string, lang: string, gdp: number, inf: number, unemp: number, rate: number, eodb: number, corr: number, dig: number, mkt: EconomicProfile["marketSize"], ind: string[]): RegionConfig {
  return { id: `${country.toLowerCase().replace(/\s+/g, "_")}_${name.toLowerCase().replace(/\s+/g, "_")}`, name, country, state, coordinates: { lat, lng }, timezone: tz, currency: cur, language: lang, economicProfile: { gdpPerCapita: gdp, inflationRate: inf, unemploymentRate: unemp, interestRate: rate, easeOfDoingBusiness: eodb, corruptionIndex: corr, digitalReadiness: dig, marketSize: mkt, primaryIndustries: ind } };
}

export const REGIONS: RegionConfig[] = [
  // ===== INDIA =====
  r("Mumbai", "India", "Maharashtra", 19.076, 72.8777, "Asia/Kolkata", "INR", "Hindi/English", 21000, 6.5, 5.2, 6.5, 63, 40, 72, "MEGA", ["Finance", "Technology", "Entertainment"]),
  r("New Delhi", "India", "Delhi", 28.6139, 77.209, "Asia/Kolkata", "INR", "Hindi/English", 18000, 6.2, 4.8, 6.5, 70, 38, 68, "MEGA", ["Government", "Technology", "Real Estate"]),
  r("Bangalore", "India", "Karnataka", 12.9716, 77.5946, "Asia/Kolkata", "INR", "Kannada/English", 22000, 5.8, 3.5, 6.5, 55, 42, 80, "LARGE", ["Technology", "Biotech", "Aerospace"]),
  r("Hyderabad", "India", "Telangana", 17.385, 78.4867, "Asia/Kolkata", "INR", "Telugu/English", 17000, 5.9, 4.2, 6.5, 60, 40, 70, "LARGE", ["Technology", "Pharmaceuticals"]),
  r("Chennai", "India", "Tamil Nadu", 13.0827, 80.2707, "Asia/Kolkata", "INR", "Tamil/English", 15000, 6.0, 4.5, 6.5, 65, 39, 65, "LARGE", ["Automobile", "Technology", "Manufacturing"]),
  r("Kolkata", "India", "West Bengal", 22.5726, 88.3639, "Asia/Kolkata", "INR", "Bengali/English", 12000, 6.3, 6.0, 6.5, 75, 36, 55, "LARGE", ["Finance", "Steel", "IT"]),
  r("Pune", "India", "Maharashtra", 18.5204, 73.8567, "Asia/Kolkata", "INR", "Marathi/English", 16000, 5.7, 3.8, 6.5, 58, 41, 72, "MEDIUM", ["Automobile", "IT", "Education"]),
  r("Ahmedabad", "India", "Gujarat", 23.0225, 72.5714, "Asia/Kolkata", "INR", "Gujarati/English", 14000, 6.1, 4.0, 6.5, 68, 38, 60, "MEDIUM", ["Textiles", "Pharmaceuticals", "Chemicals"]),
  r("Jaipur", "India", "Rajasthan", 26.9124, 75.7873, "Asia/Kolkata", "INR", "Hindi/English", 10000, 6.4, 5.5, 6.5, 80, 35, 50, "MEDIUM", ["Tourism", "Gems", "Textiles"]),
  r("Lucknow", "India", "Uttar Pradesh", 26.8467, 80.9462, "Asia/Kolkata", "INR", "Hindi/English", 9000, 6.6, 5.8, 6.5, 85, 33, 45, "MEDIUM", ["Government", "IT", "Manufacturing"]),
  r("Ambikapur", "India", "Chhattisgarh", 23.1191, 83.1979, "Asia/Kolkata", "INR", "Hindi", 8500, 7.0, 8.5, 6.5, 130, 35, 35, "SMALL", ["Agriculture", "Mining"]),

  // ===== USA =====
  r("New York", "USA", "New York", 40.7128, -74.006, "America/New_York", "USD", "English", 85000, 3.4, 3.8, 5.5, 6, 69, 92, "MEGA", ["Finance", "Technology", "Healthcare"]),
  r("San Francisco", "USA", "California", 37.7749, -122.4194, "America/Los_Angeles", "USD", "English", 95000, 3.6, 3.2, 5.5, 5, 72, 96, "LARGE", ["Technology", "Finance", "Biotech"]),
  r("Los Angeles", "USA", "California", 34.0522, -118.2437, "America/Los_Angeles", "USD", "English", 72000, 3.5, 4.5, 5.5, 15, 65, 88, "MEGA", ["Entertainment", "Technology", "Tourism"]),
  r("Chicago", "USA", "Illinois", 41.8781, -87.6298, "America/Chicago", "USD", "English", 68000, 3.2, 4.8, 5.5, 10, 67, 85, "LARGE", ["Finance", "Manufacturing", "Food"]),
  r("Houston", "USA", "Texas", 29.7604, -95.3698, "America/Chicago", "USD", "English", 65000, 3.3, 4.2, 5.5, 12, 66, 82, "LARGE", ["Energy", "Healthcare", "Aerospace"]),
  r("Miami", "USA", "Florida", 25.7617, -80.1918, "America/New_York", "USD", "English", 60000, 3.8, 3.5, 5.5, 18, 63, 80, "LARGE", ["Tourism", "Finance", "Real Estate"]),
  r("Seattle", "USA", "Washington", 47.6062, -122.3321, "America/Los_Angeles", "USD", "English", 80000, 3.4, 3.6, 5.5, 7, 70, 90, "LARGE", ["Technology", "Aerospace", "Retail"]),
  r("Boston", "USA", "Massachusetts", 42.3601, -71.0589, "America/New_York", "USD", "English", 75000, 3.1, 3.4, 5.5, 8, 71, 88, "LARGE", ["Technology", "Education", "Healthcare"]),
  r("Austin", "USA", "Texas", 30.2672, -97.7431, "America/Chicago", "USD", "English", 70000, 3.5, 3.0, 5.5, 9, 68, 87, "MEDIUM", ["Technology", "Music", "Education"]),
  r("Denver", "USA", "Colorado", 39.7392, -104.9903, "America/Denver", "USD", "English", 68000, 3.3, 3.7, 5.5, 11, 67, 84, "MEDIUM", ["Technology", "Aerospace", "Cannabis"]),

  // ===== UK =====
  r("London", "UK", "England", 51.5074, -0.1278, "Europe/London", "GBP", "English", 55000, 4.0, 4.2, 5.25, 8, 71, 90, "LARGE", ["Finance", "Technology", "Creative"]),
  r("Manchester", "UK", "England", 53.4808, -2.2426, "Europe/London", "GBP", "English", 40000, 4.1, 4.5, 5.25, 15, 68, 78, "MEDIUM", ["Technology", "Media", "Manufacturing"]),
  r("Edinburgh", "UK", "Scotland", 55.9533, -3.1883, "Europe/London", "GBP", "English/Scottish", 45000, 3.9, 3.8, 5.25, 12, 72, 80, "MEDIUM", ["Finance", "Tourism", "Education"]),
  r("Birmingham", "UK", "England", 52.4862, -1.8904, "Europe/London", "GBP", "English", 38000, 4.2, 5.0, 5.25, 18, 65, 75, "MEDIUM", ["Manufacturing", "Retail", "Services"]),

  // ===== GERMANY =====
  r("Berlin", "Germany", "Berlin", 52.52, 13.405, "Europe/Berlin", "EUR", "German/English", 45000, 2.9, 5.8, 4.5, 22, 78, 82, "LARGE", ["Technology", "Automotive", "Green Energy"]),
  r("Munich", "Germany", "Bavaria", 48.1351, 11.582, "Europe/Berlin", "EUR", "German/English", 52000, 2.7, 3.5, 4.5, 14, 80, 85, "LARGE", ["Automotive", "Technology", "Insurance"]),
  r("Frankfurt", "Germany", "Hesse", 50.1109, 8.6821, "Europe/Berlin", "EUR", "German/English", 55000, 2.8, 4.0, 4.5, 16, 77, 84, "MEDIUM", ["Finance", "Logistics", "Technology"]),
  r("Hamburg", "Germany", "Hamburg", 53.5511, 9.9937, "Europe/Berlin", "EUR", "German/English", 48000, 3.0, 5.5, 4.5, 20, 76, 80, "MEDIUM", ["Logistics", "Media", "Aerospace"]),

  // ===== FRANCE =====
  r("Paris", "France", "Ile-de-France", 48.8566, 2.3522, "Europe/Paris", "EUR", "French/English", 50000, 2.5, 7.1, 4.5, 28, 69, 85, "MEGA", ["Luxury", "Finance", "Technology"]),
  r("Lyon", "France", "Auvergne-Rhone-Alpes", 45.764, 4.8357, "Europe/Paris", "EUR", "French/English", 42000, 2.4, 6.5, 4.5, 25, 70, 78, "MEDIUM", ["Chemicals", "Biotech", "Software"]),
  r("Marseille", "France", "Provence-Alpes-Cote d'Azur", 43.2965, 5.3698, "Europe/Paris", "EUR", "French", 35000, 2.6, 8.0, 4.5, 35, 65, 70, "MEDIUM", ["Logistics", "Shipping", "Tourism"]),

  // ===== JAPAN =====
  r("Tokyo", "Japan", "Tokyo", 35.6762, 139.6503, "Asia/Tokyo", "JPY", "Japanese", 48000, 3.2, 2.5, 0.25, 29, 73, 88, "MEGA", ["Technology", "Automotive", "Electronics"]),
  r("Osaka", "Japan", "Osaka", 34.6937, 135.5023, "Asia/Tokyo", "JPY", "Japanese", 42000, 3.0, 2.8, 0.25, 35, 70, 82, "LARGE", ["Manufacturing", "Trade", "Pharmaceuticals"]),
  r("Yokohama", "Japan", "Kanagawa", 35.4437, 139.638, "Asia/Tokyo", "JPY", "Japanese", 40000, 3.1, 3.0, 0.25, 38, 68, 80, "LARGE", ["Automotive", "Ports", "Technology"]),
  r("Nagoya", "Japan", "Aichi", 35.1815, 136.9066, "Asia/Tokyo", "JPY", "Japanese", 44000, 2.9, 2.6, 0.25, 30, 72, 83, "LARGE", ["Automotive", "Aerospace", "Machinery"]),

  // ===== CHINA =====
  r("Shanghai", "China", "Shanghai", 31.2304, 121.4737, "Asia/Shanghai", "CNY", "Mandarin", 28000, 2.0, 5.2, 3.45, 31, 45, 85, "MEGA", ["Finance", "Technology", "Manufacturing"]),
  r("Beijing", "China", "Beijing", 39.9042, 116.4074, "Asia/Shanghai", "CNY", "Mandarin", 30000, 2.1, 5.0, 3.45, 28, 45, 88, "MEGA", ["Technology", "Government", "Education"]),
  r("Shenzhen", "China", "Guangdong", 22.5431, 114.0579, "Asia/Shanghai", "CNY", "Mandarin/Cantonese", 32000, 1.8, 4.5, 3.45, 20, 48, 90, "MEGA", ["Technology", "Manufacturing", "Finance"]),
  r("Guangzhou", "China", "Guangdong", 23.1291, 113.2644, "Asia/Shanghai", "CNY", "Cantonese/Mandarin", 25000, 2.2, 5.5, 3.45, 35, 43, 80, "MEGA", ["Trade", "Manufacturing", "Technology"]),
  r("Chengdu", "China", "Sichuan", 30.5728, 104.0668, "Asia/Shanghai", "CNY", "Mandarin", 18000, 2.3, 5.8, 3.45, 40, 40, 72, "LARGE", ["Technology", "Manufacturing", "Food"]),
  r("Hangzhou", "China", "Zhejiang", 30.2741, 120.1551, "Asia/Shanghai", "CNY", "Mandarin", 26000, 1.9, 4.8, 3.45, 25, 47, 87, "LARGE", ["Technology", "E-commerce", "Finance"]),
  r("Wuhan", "China", "Hubei", 30.5928, 114.3055, "Asia/Shanghai", "CNY", "Mandarin", 19000, 2.4, 5.3, 3.45, 38, 42, 75, "LARGE", ["Automotive", "Steel", "Technology"]),
  r("Hong Kong", "China", "Hong Kong", 22.3193, 114.1694, "Asia/Hong_Kong", "HKD", "Cantonese/English", 48000, 2.0, 3.0, 5.75, 3, 75, 92, "MEGA", ["Finance", "Trade", "Real Estate"]),

  // ===== SOUTH KOREA =====
  r("Seoul", "South Korea", "Seoul", 37.5665, 126.978, "Asia/Seoul", "KRW", "Korean", 38000, 3.5, 3.5, 3.5, 5, 63, 92, "MEGA", ["Technology", "Entertainment", "Finance"]),
  r("Busan", "South Korea", "Busan", 35.1796, 129.0756, "Asia/Seoul", "KRW", "Korean", 30000, 3.3, 4.0, 3.5, 15, 60, 82, "LARGE", ["Shipping", "Manufacturing", "Tourism"]),
  r("Incheon", "South Korea", "Incheon", 37.4563, 126.7052, "Asia/Seoul", "KRW", "Korean", 32000, 3.4, 3.8, 3.5, 12, 62, 85, "LARGE", ["Logistics", "Manufacturing", "Technology"]),

  // ===== SINGAPORE =====
  r("Singapore", "Singapore", "Central", 1.3521, 103.8198, "Asia/Singapore", "SGD", "English/Malay/Mandarin", 65000, 2.8, 2.0, 3.8, 2, 85, 95, "SMALL", ["Finance", "Technology", "Logistics"]),

  // ===== UAE =====
  r("Dubai", "UAE", "Dubai", 25.2048, 55.2708, "Asia/Dubai", "AED", "Arabic/English", 43000, 3.2, 2.1, 4.4, 16, 68, 88, "MEDIUM", ["Real Estate", "Tourism", "Finance"]),
  r("Abu Dhabi", "UAE", "Abu Dhabi", 24.4539, 54.3773, "Asia/Dubai", "AED", "Arabic/English", 50000, 2.8, 1.8, 4.4, 18, 70, 85, "MEDIUM", ["Oil & Gas", "Finance", "Technology"]),

  // ===== SAUDI ARABIA =====
  r("Riyadh", "Saudi Arabia", "Riyadh", 24.7136, 46.6753, "Asia/Riyadh", "SAR", "Arabic/English", 28000, 2.5, 5.5, 6.0, 62, 52, 70, "LARGE", ["Oil & Gas", "Finance", "Construction"]),
  r("Jeddah", "Saudi Arabia", "Makkah", 21.4858, 39.1925, "Asia/Riyadh", "SAR", "Arabic/English", 25000, 2.6, 6.0, 6.0, 65, 50, 68, "MEDIUM", ["Trade", "Shipping", "Tourism"]),

  // ===== TURKEY =====
  r("Istanbul", "Turkey", "Istanbul", 41.0082, 28.9784, "Europe/Istanbul", "TRY", "Turkish", 15000, 65.0, 10.0, 45.0, 33, 38, 70, "MEGA", ["Finance", "Textiles", "Tourism"]),
  r("Ankara", "Turkey", "Ankara", 39.9334, 32.8597, "Europe/Istanbul", "TRY", "Turkish", 14000, 62.0, 9.5, 45.0, 40, 36, 65, "LARGE", ["Government", "Manufacturing", "Defense"]),
  r("Izmir", "Turkey", "Izmir", 38.4237, 27.1428, "Europe/Istanbul", "TRY", "Turkish", 13000, 60.0, 11.0, 45.0, 45, 35, 62, "MEDIUM", ["Agriculture", "Manufacturing", "Tourism"]),

  // ===== BRAZIL =====
  r("Sao Paulo", "Brazil", "Sao Paulo", -23.5505, -46.6333, "America/Sao_Paulo", "BRL", "Portuguese", 18000, 4.5, 8.0, 10.5, 58, 38, 72, "MEGA", ["Finance", "Technology", "Manufacturing"]),
  r("Rio de Janeiro", "Brazil", "Rio de Janeiro", -22.9068, -43.1729, "America/Sao_Paulo", "BRL", "Portuguese", 16000, 4.8, 9.5, 10.5, 65, 36, 68, "LARGE", ["Tourism", "Energy", "Finance"]),
  r("Brasilia", "Brazil", "Federal District", -15.7975, -47.8919, "America/Sao_Paulo", "BRL", "Portuguese", 20000, 4.2, 7.0, 10.5, 45, 40, 75, "MEDIUM", ["Government", "Services", "Technology"]),
  r("Curitiba", "Brazil", "Parana", -25.4284, -49.2733, "America/Sao_Paulo", "BRL", "Portuguese", 15000, 4.3, 7.5, 10.5, 50, 42, 70, "MEDIUM", ["Technology", "Automotive", "Green Energy"]),

  // ===== MEXICO =====
  r("Mexico City", "Mexico", "Mexico City", 19.4326, -99.1332, "America/Mexico_City", "MXN", "Spanish", 14000, 5.5, 3.5, 11.0, 38, 31, 65, "MEGA", ["Finance", "Technology", "Manufacturing"]),
  r("Guadalajara", "Mexico", "Jalisco", 20.6597, -103.3496, "America/Mexico_City", "MXN", "Spanish", 12000, 5.2, 4.0, 11.0, 42, 33, 62, "LARGE", ["Technology", "Electronics", "Agriculture"]),
  r("Monterrey", "Mexico", "Nuevo Leon", 25.6866, -100.3161, "America/Mexico_City", "MXN", "Spanish", 15000, 5.0, 3.2, 11.0, 35, 34, 68, "LARGE", ["Manufacturing", "Finance", "Technology"]),

  // ===== CANADA =====
  r("Toronto", "Canada", "Ontario", 43.6532, -79.3832, "America/Toronto", "CAD", "English/French", 52000, 3.4, 5.8, 5.0, 23, 74, 84, "MEDIUM", ["Finance", "Technology", "Film"]),
  r("Vancouver", "Canada", "British Columbia", 49.2827, -123.1207, "America/Vancouver", "CAD", "English", 50000, 3.6, 5.5, 5.0, 20, 76, 86, "MEDIUM", ["Technology", "Real Estate", "Film"]),
  r("Montreal", "Canada", "Quebec", 45.5017, -73.5673, "America/Toronto", "CAD", "French/English", 45000, 3.5, 6.0, 5.0, 25, 72, 80, "MEDIUM", ["Technology", "Aerospace", "Gaming"]),
  r("Calgary", "Canada", "Alberta", 51.0447, -114.0719, "America/Edmonton", "CAD", "English", 55000, 3.2, 5.0, 5.0, 18, 75, 82, "MEDIUM", ["Energy", "Finance", "Technology"]),

  // ===== AUSTRALIA =====
  r("Sydney", "Australia", "New South Wales", -33.8688, 151.2093, "Australia/Sydney", "AUD", "English", 58000, 4.1, 3.7, 4.35, 14, 77, 86, "MEDIUM", ["Finance", "Mining", "Technology"]),
  r("Melbourne", "Australia", "Victoria", -37.8136, 144.9631, "Australia/Melbourne", "AUD", "English", 52000, 4.0, 4.0, 4.35, 16, 75, 84, "MEDIUM", ["Technology", "Finance", "Education"]),
  r("Brisbane", "Australia", "Queensland", -27.4698, 153.0251, "Australia/Brisbane", "AUD", "English", 48000, 4.2, 4.2, 4.35, 18, 73, 80, "MEDIUM", ["Mining", "Tourism", "Technology"]),
  r("Perth", "Australia", "Western Australia", -31.9505, 115.8605, "Australia/Perth", "AUD", "English", 55000, 3.8, 3.5, 4.35, 12, 74, 78, "MEDIUM", ["Mining", "Energy", "Technology"]),

  // ===== NEW ZEALAND =====
  r("Auckland", "New Zealand", "Auckland", -36.8485, 174.7633, "Pacific/Auckland", "NZD", "English/Maori", 42000, 3.5, 3.5, 5.5, 10, 78, 82, "MEDIUM", ["Technology", "Agriculture", "Tourism"]),
  r("Wellington", "New Zealand", "Wellington", -41.2865, 174.7762, "Pacific/Auckland", "NZD", "English/Maori", 40000, 3.3, 3.8, 5.5, 8, 80, 84, "MEDIUM", ["Government", "Film", "Technology"]),

  // ===== SOUTH AFRICA =====
  r("Johannesburg", "South Africa", "Gauteng", -26.2041, 28.0473, "Africa/Johannesburg", "ZAR", "English/Zulu", 12000, 5.5, 32.0, 8.25, 84, 43, 55, "LARGE", ["Finance", "Mining", "Technology"]),
  r("Cape Town", "South Africa", "Western Cape", -33.9249, 18.4241, "Africa/Johannesburg", "ZAR", "English/Afrikaans", 11000, 5.3, 28.0, 8.25, 75, 45, 60, "MEDIUM", ["Tourism", "Technology", "Finance"]),
  r("Durban", "South Africa", "KwaZulu-Natal", -29.8587, 31.0218, "Africa/Johannesburg", "ZAR", "English/Zulu", 9000, 5.8, 35.0, 8.25, 90, 40, 50, "MEDIUM", ["Manufacturing", "Logistics", "Tourism"]),

  // ===== NIGERIA =====
  r("Lagos", "Nigeria", "Lagos", 6.5244, 3.3792, "Africa/Lagos", "NGN", "English", 5000, 18.0, 33.0, 18.0, 169, 25, 42, "LARGE", ["Technology", "Finance", "Entertainment"]),
  r("Abuja", "Nigeria", "Federal Capital Territory", 9.0579, 7.4951, "Africa/Lagos", "NGN", "English", 6000, 17.5, 30.0, 18.0, 155, 28, 45, "MEDIUM", ["Government", "Services", "Technology"]),

  // ===== KENYA =====
  r("Nairobi", "Kenya", "Nairobi", -1.2921, 36.8219, "Africa/Nairobi", "KES", "English/Swahili", 4500, 7.0, 12.0, 13.0, 56, 28, 50, "MEDIUM", ["Technology", "Finance", "Agriculture"]),
  r("Mombasa", "Kenya", "Coast", -4.0435, 39.6682, "Africa/Nairobi", "KES", "English/Swahili", 3000, 7.5, 15.0, 13.0, 70, 25, 35, "SMALL", ["Shipping", "Tourism", "Agriculture"]),

  // ===== EGYPT =====
  r("Cairo", "Egypt", "Cairo", 30.0444, 31.2357, "Africa/Cairo", "EGP", "Arabic/English", 8000, 35.0, 7.0, 21.25, 94, 35, 48, "LARGE", ["Tourism", "Manufacturing", "Technology"]),
  r("Alexandria", "Egypt", "Alexandria", 31.2001, 29.9187, "Africa/Cairo", "EGP", "Arabic/English", 6000, 34.0, 8.5, 21.25, 100, 33, 42, "MEDIUM", ["Shipping", "Manufacturing", "Agriculture"]),

  // ===== ISRAEL =====
  r("Tel Aviv", "Israel", "Tel Aviv", 32.0853, 34.7818, "Asia/Jerusalem", "ILS", "Hebrew/English", 52000, 3.0, 3.5, 4.5, 15, 62, 90, "MEDIUM", ["Technology", "Finance", "Cybersecurity"]),
  r("Jerusalem", "Israel", "Jerusalem", 31.7683, 35.2137, "Asia/Jerusalem", "ILS", "Hebrew/Arabic", 35000, 3.2, 4.0, 4.5, 20, 58, 78, "MEDIUM", ["Tourism", "Government", "Technology"]),

  // ===== RUSSIA =====
  r("Moscow", "Russia", "Moscow", 55.7558, 37.6173, "Europe/Moscow", "RUB", "Russian", 25000, 7.5, 4.0, 16.0, 28, 29, 72, "MEGA", ["Finance", "Energy", "Technology"]),
  r("Saint Petersburg", "Russia", "Leningrad", 59.9343, 30.3351, "Europe/Moscow", "RUB", "Russian", 20000, 7.0, 4.5, 16.0, 35, 30, 68, "LARGE", ["Manufacturing", "Tourism", "Technology"]),

  // ===== ITALY =====
  r("Rome", "Italy", "Lazio", 41.9028, 12.4964, "Europe/Rome", "EUR", "Italian/English", 38000, 1.5, 8.0, 4.5, 30, 56, 72, "LARGE", ["Tourism", "Fashion", "Government"]),
  r("Milan", "Italy", "Lombardy", 45.4642, 9.19, "Europe/Rome", "EUR", "Italian/English", 45000, 1.4, 7.0, 4.5, 22, 58, 78, "LARGE", ["Finance", "Fashion", "Technology"]),
  r("Naples", "Italy", "Campania", 40.8518, 14.2681, "Europe/Rome", "EUR", "Italian", 25000, 1.8, 12.0, 4.5, 45, 50, 60, "MEDIUM", ["Tourism", "Manufacturing", "Agriculture"]),

  // ===== SPAIN =====
  r("Madrid", "Spain", "Madrid", 40.4168, -3.7038, "Europe/Madrid", "EUR", "Spanish/English", 38000, 2.0, 12.0, 4.5, 30, 60, 75, "LARGE", ["Finance", "Technology", "Tourism"]),
  r("Barcelona", "Spain", "Catalonia", 41.3874, 2.1686, "Europe/Madrid", "EUR", "Spanish/Catalan", 40000, 2.1, 11.0, 4.5, 25, 62, 78, "LARGE", ["Technology", "Tourism", "Manufacturing"]),
  r("Valencia", "Spain", "Valencia", 39.4699, -0.3763, "Europe/Madrid", "EUR", "Spanish", 28000, 2.2, 13.0, 4.5, 35, 58, 68, "MEDIUM", ["Agriculture", "Manufacturing", "Tourism"]),

  // ===== NETHERLANDS =====
  r("Amsterdam", "Netherlands", "North Holland", 52.3676, 4.9041, "Europe/Amsterdam", "EUR", "Dutch/English", 55000, 2.8, 3.5, 4.5, 5, 80, 90, "MEDIUM", ["Finance", "Technology", "Logistics"]),
  r("Rotterdam", "Netherlands", "South Holland", 51.9244, 4.4777, "Europe/Amsterdam", "EUR", "Dutch/English", 48000, 2.9, 4.0, 4.5, 8, 78, 85, "MEDIUM", ["Logistics", "Energy", "Manufacturing"]),

  // ===== SWITZERLAND =====
  r("Zurich", "Switzerland", "Zurich", 47.3769, 8.5417, "Europe/Zurich", "CHF", "German/English", 80000, 1.5, 2.3, 1.75, 2, 85, 92, "MEDIUM", ["Finance", "Technology", "Pharmaceuticals"]),
  r("Geneva", "Switzerland", "Geneva", 46.2044, 6.1432, "Europe/Zurich", "CHF", "French/English", 75000, 1.4, 2.5, 1.75, 3, 84, 90, "SMALL", ["Finance", "Diplomacy", "Pharmaceuticals"]),

  // ===== SWEDEN =====
  r("Stockholm", "Sweden", "Stockholm", 59.3293, 18.0686, "Europe/Stockholm", "SEK", "Swedish/English", 55000, 3.5, 7.5, 3.75, 10, 83, 90, "MEDIUM", ["Technology", "Finance", "Gaming"]),
  r("Gothenburg", "Sweden", "Vastra Gotaland", 57.7089, 11.9746, "Europe/Stockholm", "SEK", "Swedish/English", 48000, 3.3, 7.0, 3.75, 12, 82, 86, "MEDIUM", ["Automotive", "Manufacturing", "Technology"]),

  // ===== NORWAY =====
  r("Oslo", "Norway", "Oslo", 59.9139, 10.7522, "Europe/Oslo", "NOK", "Norwegian/English", 65000, 3.0, 3.5, 4.5, 5, 85, 90, "MEDIUM", ["Energy", "Finance", "Technology"]),
  r("Bergen", "Norway", "Vestland", 60.3913, 5.3221, "Europe/Oslo", "NOK", "Norwegian", 55000, 3.2, 3.8, 4.5, 8, 84, 85, "SMALL", ["Fisheries", "Energy", "Tourism"]),

  // ===== DENMARK =====
  r("Copenhagen", "Denmark", "Capital", 55.6761, 12.5683, "Europe/Copenhagen", "DKK", "Danish/English", 60000, 2.5, 5.0, 3.75, 4, 88, 92, "MEDIUM", ["Finance", "Technology", "Pharmaceuticals"]),

  // ===== FINLAND =====
  r("Helsinki", "Finland", "Uusimaa", 60.1699, 24.9384, "Europe/Helsinki", "EUR", "Finnish/English", 48000, 3.0, 7.2, 4.25, 8, 87, 90, "SMALL", ["Technology", "Gaming", "Manufacturing"]),

  // ===== POLAND =====
  r("Warsaw", "Poland", "Masovia", 52.2297, 21.0122, "Europe/Warsaw", "PLN", "Polish/English", 20000, 11.0, 3.0, 6.75, 40, 55, 72, "MEDIUM", ["Finance", "Technology", "Manufacturing"]),
  r("Krakow", "Poland", "Lesser Poland", 50.0647, 19.945, "Europe/Warsaw", "PLN", "Polish/English", 18000, 10.5, 3.2, 6.75, 42, 56, 70, "MEDIUM", ["Technology", "Tourism", "Manufacturing"]),

  // ===== CZECH REPUBLIC =====
  r("Prague", "Czech Republic", "Prague", 50.0755, 14.4378, "Europe/Prague", "CZK", "Czech/English", 25000, 3.5, 2.8, 7.0, 18, 57, 75, "MEDIUM", ["Technology", "Manufacturing", "Tourism"]),

  // ===== PORTUGAL =====
  r("Lisbon", "Portugal", "Lisbon", 38.7223, -9.1393, "Europe/Lisbon", "EUR", "Portuguese/English", 25000, 3.0, 6.5, 4.5, 20, 61, 72, "MEDIUM", ["Tourism", "Technology", "Manufacturing"]),
  r("Porto", "Portugal", "Norte", 41.1579, -8.6291, "Europe/Lisbon", "EUR", "Portuguese", 22000, 2.8, 7.0, 4.5, 25, 60, 68, "SMALL", ["Manufacturing", "Tourism", "Technology"]),

  // ===== GREECE =====
  r("Athens", "Greece", "Attica", 37.9838, 23.7275, "Europe/Athens", "EUR", "Greek/English", 22000, 3.0, 12.0, 4.5, 50, 52, 65, "MEDIUM", ["Tourism", "Shipping", "Technology"]),

  // ===== THAILAND =====
  r("Bangkok", "Thailand", "Bangkok", 13.7563, 100.5018, "Asia/Bangkok", "THB", "Thai/English", 12000, 1.5, 1.2, 2.5, 21, 36, 65, "LARGE", ["Tourism", "Manufacturing", "Finance"]),
  r("Chiang Mai", "Thailand", "Chiang Mai", 18.7883, 98.9853, "Asia/Bangkok", "THB", "Thai/English", 8000, 1.3, 1.0, 2.5, 30, 38, 55, "SMALL", ["Tourism", "Technology", "Agriculture"]),

  // ===== VIETNAM =====
  r("Ho Chi Minh City", "Vietnam", "Ho Chi Minh", 10.8231, 106.6297, "Asia/Ho_Chi_Minh", "VND", "Vietnamese", 8000, 3.0, 2.1, 6.0, 70, 41, 55, "LARGE", ["Manufacturing", "Technology", "Finance"]),
  r("Hanoi", "Vietnam", "Hanoi", 21.0285, 105.8542, "Asia/Ho_Chi_Minh", "VND", "Vietnamese", 7500, 3.2, 2.3, 6.0, 75, 40, 52, "LARGE", ["Manufacturing", "Government", "Technology"]),

  // ===== INDONESIA =====
  r("Jakarta", "Indonesia", "DKI Jakarta", -6.2088, 106.8456, "Asia/Jakarta", "IDR", "Indonesian", 8000, 3.0, 5.8, 6.0, 73, 34, 55, "MEGA", ["Finance", "Manufacturing", "Technology"]),
  r("Surabaya", "Indonesia", "East Java", -7.2575, 112.7521, "Asia/Jakarta", "IDR", "Indonesian", 6000, 3.2, 6.5, 6.0, 80, 32, 48, "LARGE", ["Manufacturing", "Trade", "Agriculture"]),
  r("Bali", "Indonesia", "Bali", -8.3405, 115.092, "Asia/Makassar", "IDR", "Indonesian", 5000, 2.8, 4.5, 6.0, 55, 36, 52, "MEDIUM", ["Tourism", "Agriculture", "Creative"]),

  // ===== PHILIPPINES =====
  r("Manila", "Philippines", "NCR", 14.5995, 120.9842, "Asia/Manila", "PHP", "Filipino/English", 6000, 4.5, 4.5, 6.5, 95, 33, 50, "LARGE", ["BPO", "Finance", "Manufacturing"]),
  r("Cebu", "Philippines", "Central Visayas", 10.3157, 123.8854, "Asia/Manila", "PHP", "Filipino/English", 5000, 4.2, 5.0, 6.5, 85, 35, 48, "MEDIUM", ["BPO", "Manufacturing", "Tourism"]),

  // ===== MALAYSIA =====
  r("Kuala Lumpur", "Malaysia", "Federal Territory", 3.139, 101.6869, "Asia/Kuala_Lumpur", "MYR", "Malay/English", 14000, 3.0, 3.5, 3.0, 12, 50, 72, "LARGE", ["Finance", "Technology", "Manufacturing"]),
  r("Penang", "Malaysia", "Penang", 5.4164, 100.3327, "Asia/Kuala_Lumpur", "MYR", "Malay/English", 12000, 2.8, 3.2, 3.0, 15, 48, 70, "MEDIUM", ["Electronics", "Manufacturing", "Tourism"]),

  // ===== PAKISTAN =====
  r("Karachi", "Pakistan", "Sindh", 24.8607, 67.0011, "Asia/Karachi", "PKR", "Urdu/English", 4500, 30.0, 6.5, 22.0, 108, 28, 35, "LARGE", ["Finance", "Manufacturing", "Shipping"]),
  r("Lahore", "Pakistan", "Punjab", 31.5204, 74.3587, "Asia/Karachi", "PKR", "Urdu/English", 4000, 28.0, 7.0, 22.0, 115, 27, 32, "LARGE", ["Manufacturing", "Technology", "Agriculture"]),
  r("Islamabad", "Pakistan", "Federal Capital", 33.6844, 73.0479, "Asia/Karachi", "PKR", "Urdu/English", 5500, 27.0, 5.5, 22.0, 85, 30, 40, "MEDIUM", ["Government", "Services", "Technology"]),

  // ===== BANGLADESH =====
  r("Dhaka", "Bangladesh", "Dhaka", 23.8103, 90.4125, "Asia/Dhaka", "BDT", "Bangla/English", 5500, 9.0, 5.5, 7.0, 128, 25, 38, "LARGE", ["Manufacturing", "Textiles", "Technology"]),
  r("Chittagong", "Bangladesh", "Chittagong", 22.3569, 91.7832, "Asia/Dhaka", "BDT", "Bangla/English", 4000, 8.5, 6.0, 7.0, 135, 24, 32, "MEDIUM", ["Shipping", "Manufacturing", "Agriculture"]),

  // ===== SRI LANKA =====
  r("Colombo", "Sri Lanka", "Western", 6.9271, 79.8612, "Asia/Colombo", "LKR", "Sinhala/Tamil", 5000, 50.0, 5.2, 7.0, 99, 34, 48, "MEDIUM", ["Finance", "Technology", "Tourism"]),

  // ===== NEPAL =====
  r("Kathmandu", "Nepal", "Bagmati", 27.7172, 85.324, "Asia/Kathmandu", "NPR", "Nepali", 3500, 7.5, 4.5, 7.0, 94, 33, 35, "SMALL", ["Tourism", "Agriculture", "Technology"]),

  // ===== MOROCCO =====
  r("Casablanca", "Morocco", "Casablanca-Settat", 33.5731, -7.5898, "Africa/Casablanca", "MAD", "Arabic/French", 8000, 5.0, 11.0, 3.0, 54, 38, 52, "MEDIUM", ["Manufacturing", "Finance", "Tourism"]),
  r("Rabat", "Morocco", "Rabat-Sale-Kenitra", 34.0209, -6.8416, "Africa/Casablanca", "MAD", "Arabic/French", 7500, 4.8, 10.5, 3.0, 58, 39, 50, "MEDIUM", ["Government", "Manufacturing", "Agriculture"]),

  // ===== ETHIOPIA =====
  r("Addis Ababa", "Ethiopia", "Addis Ababa", 9.0192, 38.7525, "Africa/Addis_Ababa", "ETB", "Amharic/English", 3000, 28.0, 5.0, 15.0, 125, 38, 30, "MEDIUM", ["Agriculture", "Manufacturing", "Diplomacy"]),

  // ===== TANZANIA =====
  r("Dar es Salaam", "Tanzania", "Dar es Salaam", -6.7924, 39.2083, "Africa/Dar_es_Salaam", "TZS", "Swahili/English", 2800, 4.0, 5.0, 6.0, 140, 38, 32, "SMALL", ["Agriculture", "Manufacturing", "Services"]),

  // ===== GHANA =====
  r("Accra", "Ghana", "Greater Accra", 5.6037, -0.187, "Africa/Accra", "GHS", "English", 5500, 12.0, 4.5, 13.0, 75, 42, 45, "SMALL", ["Finance", "Technology", "Agriculture"]),

  // ===== COLOMBIA =====
  r("Bogota", "Colombia", "Cundinamarca", 4.711, -74.0721, "America/Bogota", "COP", "Spanish", 8000, 9.0, 10.0, 13.0, 72, 39, 55, "LARGE", ["Finance", "Technology", "Manufacturing"]),
  r("Medellin", "Colombia", "Antioquia", 6.2442, -75.5812, "America/Bogota", "COP", "Spanish", 7000, 8.5, 11.0, 13.0, 65, 40, 58, "MEDIUM", ["Technology", "Manufacturing", "Tourism"]),

  // ===== ARGENTINA =====
  r("Buenos Aires", "Argentina", "Buenos Aires", -34.6037, -58.3816, "America/Argentina/Buenos_Aires", "ARS", "Spanish", 12000, 110.0, 6.5, 110.0, 60, 38, 60, "MEGA", ["Finance", "Technology", "Agriculture"]),
  r("Cordoba", "Argentina", "Cordoba", -31.4201, -64.1888, "America/Argentina/Buenos_Aires", "ARS", "Spanish", 10000, 105.0, 7.0, 110.0, 68, 36, 55, "MEDIUM", ["Manufacturing", "Agriculture", "Education"]),

  // ===== CHILE =====
  r("Santiago", "Chile", "Santiago", -33.4489, -70.6693, "America/Santiago", "CLP", "Spanish", 18000, 7.5, 8.5, 11.25, 55, 67, 68, "MEDIUM", ["Mining", "Finance", "Technology"]),
  r("Valparaiso", "Chile", "Valparaiso", -33.0472, -71.6127, "America/Santiago", "CLP", "Spanish", 14000, 7.0, 9.0, 11.25, 60, 65, 62, "SMALL", ["Shipping", "Wine", "Tourism"]),

  // ===== PERU =====
  r("Lima", "Peru", "Lima", -12.0464, -77.0428, "America/Lima", "PEN", "Spanish", 8500, 6.5, 6.8, 7.5, 65, 36, 52, "LARGE", ["Finance", "Mining", "Technology"]),

  // ===== ECUADOR =====
  r("Quito", "Ecuador", "Pichincha", -0.1807, -78.4678, "America/Guayaquil", "USD", "Spanish", 6500, 2.5, 4.0, 8.0, 80, 36, 48, "MEDIUM", ["Oil", "Agriculture", "Tourism"]),

  // ===== VENEZUELA =====
  r("Caracas", "Venezuela", "Distrito Capital", 10.4806, -66.9036, "America/Caracas", "VES", "Spanish", 4000, 200.0, 8.0, 58.0, 188, 14, 30, "MEDIUM", ["Oil", "Manufacturing", "Services"]),

  // ===== UKRAINE =====
  r("Kyiv", "Ukraine", "Kyiv", 50.4501, 30.5234, "Europe/Kyiv", "UAH", "Ukrainian", 8000, 12.0, 7.0, 22.0, 64, 33, 58, "MEDIUM", ["Technology", "Agriculture", "Manufacturing"]),
  r("Lviv", "Ukraine", "Lviv", 49.8397, 24.0297, "Europe/Kyiv", "UAH", "Ukrainian", 6500, 11.0, 7.5, 22.0, 70, 34, 55, "MEDIUM", ["Technology", "Tourism", "Manufacturing"]),

  // ===== ROMANIA =====
  r("Bucharest", "Romania", "Bucharest", 44.4268, 26.1025, "Europe/Bucharest", "RON", "Romanian/English", 16000, 5.0, 5.5, 7.0, 45, 46, 68, "MEDIUM", ["Technology", "Manufacturing", "Finance"]),

  // ===== HUNGARY =====
  r("Budapest", "Hungary", "Central Hungary", 47.4979, 19.0402, "Europe/Budapest", "HUF", "Hungarian/English", 18000, 5.5, 3.5, 13.0, 42, 53, 72, "MEDIUM", ["Manufacturing", "Technology", "Finance"]),

  // ===== AUSTRIA =====
  r("Vienna", "Austria", "Vienna", 48.2082, 16.3738, "Europe/Vienna", "EUR", "German/English", 50000, 3.0, 5.0, 4.0, 18, 71, 82, "MEDIUM", ["Finance", "Technology", "Real Estate"]),

  // ===== IRELAND =====
  r("Dublin", "Ireland", "Leinster", 53.3498, -6.2603, "Europe/Dublin", "EUR", "English", 80000, 2.5, 4.5, 4.5, 5, 77, 88, "MEDIUM", ["Technology", "Finance", "Pharmaceuticals"]),
  r("Cork", "Ireland", "Munster", 51.8985, -8.4756, "Europe/Dublin", "EUR", "English", 55000, 2.3, 4.0, 4.5, 8, 76, 82, "SMALL", ["Pharmaceuticals", "Technology", "Agriculture"]),

  // ===== ISRAEL =====
  r("Haifa", "Israel", "Haifa", 32.794, 34.9896, "Asia/Jerusalem", "ILS", "Hebrew/English", 40000, 3.1, 4.2, 4.5, 18, 60, 82, "SMALL", ["Technology", "Industry", "Tourism"]),

  // ===== SAUDI ARABIA =====
  r("Dammam", "Saudi Arabia", "Eastern", 26.4207, 50.0888, "Asia/Riyadh", "SAR", "Arabic/English", 30000, 2.4, 5.0, 6.0, 55, 53, 72, "MEDIUM", ["Oil & Gas", "Manufacturing", "Finance"]),

  // ===== QATAR =====
  r("Doha", "Qatar", "Ad Dawhah", 25.2854, 51.531, "Asia/Qatar", "QAR", "Arabic/English", 60000, 2.5, 0.1, 6.0, 5, 58, 82, "MEDIUM", ["Energy", "Finance", "Tourism"]),

  // ===== KUWAIT =====
  r("Kuwait City", "Kuwait", "Al Asimah", 29.3759, 47.9774, "Asia/Kuwait", "KWD", "Arabic/English", 35000, 3.5, 2.0, 4.25, 40, 40, 70, "MEDIUM", ["Oil & Gas", "Finance", "Construction"]),

  // ===== BAHRAIN =====
  r("Manama", "Bahrain", "Capital", 26.2285, 50.586, "Asia/Bahrain", "BHD", "Arabic/English", 28000, 1.5, 3.5, 6.0, 35, 51, 75, "SMALL", ["Finance", "Oil & Gas", "Technology"]),

  // ===== OMAN =====
  r("Muscat", "Oman", "Muscat", 23.588, 58.3829, "Asia/Muscat", "OMR", "Arabic/English", 20000, 1.5, 3.0, 5.5, 38, 45, 65, "SMALL", ["Oil & Gas", "Tourism", "Logistics"]),

  // ===== JORDAN =====
  r("Amman", "Jordan", "Amman", 31.9454, 35.9284, "Asia/Amman", "JOD", "Arabic/English", 10000, 2.0, 18.0, 7.5, 60, 48, 58, "MEDIUM", ["Technology", "Tourism", "Services"]),

  // ===== LEBANON =====
  r("Beirut", "Lebanon", "Beirut", 33.8938, 35.5018, "Asia/Beirut", "LBP", "Arabic/French", 8000, 100.0, 12.0, 10.0, 143, 28, 55, "SMALL", ["Banking", "Tourism", "Technology"]),

  // ===== IRAQ =====
  r("Baghdad", "Iraq", "Baghdad", 33.3152, 44.3661, "Asia/Baghdad", "IQD", "Arabic", 6000, 5.0, 15.0, 4.0, 162, 21, 35, "MEDIUM", ["Oil & Gas", "Construction", "Services"]),

  // ===== IRAN =====
  r("Tehran", "Iran", "Tehran", 35.6892, 51.389, "Asia/Tehran", "IRR", "Persian", 8000, 40.0, 10.0, 23.0, 127, 25, 52, "LARGE", ["Oil & Gas", "Manufacturing", "Technology"]),

  // ===== CHINA (more) =====
  r("Tianjin", "China", "Tianjin", 39.3434, 117.3616, "Asia/Shanghai", "CNY", "Mandarin", 20000, 2.2, 5.5, 3.45, 36, 43, 78, "LARGE", ["Manufacturing", "Shipping", "Aerospace"]),
  r("Nanjing", "China", "Jiangsu", 32.0603, 118.7969, "Asia/Shanghai", "CNY", "Mandarin", 22000, 2.0, 5.0, 3.45, 32, 44, 80, "LARGE", ["Technology", "Manufacturing", "Education"]),
  r("Xian", "China", "Shaanxi", 34.3416, 108.9398, "Asia/Shanghai", "CNY", "Mandarin", 15000, 2.5, 6.0, 3.45, 42, 40, 70, "MEDIUM", ["Technology", "Aerospace", "Tourism"]),

  // ===== JAPAN (more) =====
  r("Fukuoka", "Japan", "Fukuoka", 33.5904, 130.4017, "Asia/Tokyo", "JPY", "Japanese", 35000, 2.8, 3.2, 0.25, 32, 69, 78, "MEDIUM", ["Technology", "Startup", "Food"]),
  r("Sapporo", "Japan", "Hokkaido", 43.0618, 141.3545, "Asia/Tokyo", "JPY", "Japanese", 38000, 2.9, 3.0, 0.25, 30, 70, 75, "MEDIUM", ["Tourism", "Food", "Manufacturing"]),

  // ===== SOUTH KOREA (more) =====
  r("Daegu", "South Korea", "Daegu", 35.8562, 128.6014, "Asia/Seoul", "KRW", "Korean", 28000, 3.2, 4.2, 3.5, 18, 58, 78, "MEDIUM", ["Textiles", "Technology", "Manufacturing"]),
  r("Daejeon", "South Korea", "Daejeon", 36.3504, 127.3845, "Asia/Seoul", "KRW", "Korean", 30000, 3.0, 3.5, 3.5, 12, 60, 85, "MEDIUM", ["Technology", "Research", "Aerospace"]),

  // ===== TAIWAN =====
  r("Taipei", "Taiwan", "Taipei", 25.033, 121.5654, "Asia/Taipei", "TWD", "Mandarin", 35000, 2.0, 3.5, 2.0, 10, 68, 90, "MEDIUM", ["Technology", "Electronics", "Finance"]),
  r("Kaohsiung", "Taiwan", "Kaohsiung", 22.6273, 120.3014, "Asia/Taipei", "TWD", "Mandarin", 28000, 2.1, 3.8, 2.0, 15, 65, 82, "MEDIUM", ["Manufacturing", "Shipping", "Technology"]),

  // ===== MYANMAR =====
  r("Yangon", "Myanmar", "Yangon", 16.8661, 96.1951, "Asia/Yangon", "MMK", "Burmese", 3000, 8.0, 2.0, 7.0, 165, 25, 25, "SMALL", ["Manufacturing", "Agriculture", "Services"]),

  // ===== CAMBODIA =====
  r("Phnom Penh", "Cambodia", "Phnom Penh", 11.5564, 104.9282, "Asia/Phnom_Penh", "KHR", "Khmer/English", 4000, 3.0, 2.5, 6.5, 138, 25, 40, "SMALL", ["Tourism", "Manufacturing", "Construction"]),

  // ===== LAOS =====
  r("Vientiane", "Laos", "Vientiane", 17.9757, 102.6331, "Asia/Vientiane", "LAK", "Lao", 4500, 3.5, 3.0, 7.5, 154, 30, 35, "SMALL", ["Hydropower", "Mining", "Agriculture"]),

  // ===== MONGOLIA =====
  r("Ulaanbaatar", "Mongolia", "Ulaanbaatar", 47.8864, 106.9057, "Asia/Ulaanbaatar", "MNT", "Mongolian", 5500, 8.0, 5.5, 13.0, 75, 35, 50, "SMALL", ["Mining", "Agriculture", "Technology"]),

  // ===== KAZAKHSTAN =====
  r("Almaty", "Kazakhstan", "Almaty", 43.222, 76.8512, "Asia/Almaty", "KZT", "Kazakh/Russian", 12000, 8.0, 4.8, 14.75, 25, 37, 62, "MEDIUM", ["Finance", "Mining", "Technology"]),
  r("Nur-Sultan", "Kazakhstan", "Astana", 51.1694, 71.4491, "Asia/Almaty", "KZT", "Kazakh/Russian", 14000, 7.5, 4.5, 14.75, 22, 38, 65, "MEDIUM", ["Government", "Finance", "Construction"]),

  // ===== UZBEKISTAN =====
  r("Tashkent", "Uzbekistan", "Tashkent", 41.2995, 69.2401, "Asia/Tashkent", "UZS", "Uzbek/Russian", 5000, 10.0, 5.5, 14.0, 65, 28, 45, "MEDIUM", ["Gas", "Cotton", "Technology"]),

  // ===== GEORGIA =====
  r("Tbilisi", "Georgia", "Tbilisi", 41.7151, 44.8271, "Asia/Tbilisi", "GEL", "Georgian", 8000, 3.0, 5.0, 8.0, 7, 53, 60, "SMALL", ["Tourism", "Wine", "Technology"]),

  // ===== CYPRUS =====
  r("Nicosia", "Cyprus", "Nicosia", 35.1856, 33.3823, "Asia/Nicosia", "EUR", "Greek/English", 32000, 2.0, 6.0, 4.25, 32, 58, 72, "SMALL", ["Finance", "Tourism", "Technology"]),

  // ===== ICELAND =====
  r("Reykjavik", "Iceland", "Capital", 64.1466, -21.9426, "Atlantic/Reykjavik", "ISK", "Icelandic/English", 60000, 5.0, 3.5, 9.25, 1, 82, 88, "SMALL", ["Energy", "Tourism", "Fishing"]),

  // ===== LUXEMBOURG =====
  r("Luxembourg City", "Luxembourg", "Luxembourg", 49.6117, 6.1319, "Europe/Luxembourg", "EUR", "French/German/English", 115000, 2.5, 5.5, 4.25, 2, 82, 90, "SMALL", ["Finance", "Technology", "Steel"]),

  // ===== MALTA =====
  r("Valletta", "Malta", "South Eastern", 35.8989, 14.5146, "Europe/Malta", "EUR", "Maltese/English", 30000, 3.0, 3.5, 4.5, 20, 56, 75, "SMALL", ["Finance", "Gaming", "Tourism"]),

  // ===== ESTONIA =====
  r("Tallinn", "Estonia", "Harju", 59.437, 24.7536, "Europe/Tallinn", "EUR", "Estonian/English", 28000, 5.0, 5.5, 4.5, 10, 78, 88, "SMALL", ["Technology", "Finance", "Logistics"]),

  // ===== LATVIA =====
  r("Riga", "Latvia", "Riga", 56.9496, 24.1052, "Europe/Riga", "EUR", "Latvian/English", 22000, 5.5, 6.5, 4.5, 16, 58, 70, "SMALL", ["Finance", "Logistics", "Technology"]),

  // ===== LITHUANIA =====
  r("Vilnius", "Lithuania", "Vilnius", 54.6872, 25.2797, "Europe/Vilnius", "EUR", "Lithuanian/English", 24000, 4.5, 6.0, 4.5, 12, 60, 75, "SMALL", ["Technology", "Finance", "Logistics"]),

  // ===== CROATIA =====
  r("Zagreb", "Croatia", "City of Zagreb", 45.815, 15.9819, "Europe/Zagreb", "EUR", "Croatian/English", 20000, 3.0, 6.5, 4.5, 30, 48, 68, "SMALL", ["Technology", "Tourism", "Manufacturing"]),

  // ===== SERBIA =====
  r("Belgrade", "Serbia", "Belgrade", 44.7866, 20.4489, "Europe/Belgrade", "RSD", "Serbian/English", 10000, 8.0, 9.0, 6.5, 44, 36, 58, "MEDIUM", ["Technology", "Manufacturing", "Finance"]),

  // ===== BULGARIA =====
  r("Sofia", "Bulgaria", "Sofia City", 42.6977, 23.3219, "Europe/Sofia", "BGN", "Bulgarian/English", 14000, 5.5, 4.5, 4.0, 38, 43, 65, "MEDIUM", ["Technology", "Outsourcing", "Manufacturing"]),

  // ===== TUNISIA =====
  r("Tunis", "Tunisia", "Tunis", 36.8065, 10.1815, "Africa/Tunis", "TND", "Arabic/French", 7000, 8.0, 15.0, 8.0, 78, 40, 50, "MEDIUM", ["Manufacturing", "Tourism", "Technology"]),

  // ===== ALGERIA =====
  r("Algiers", "Algeria", "Algiers", 36.7538, 3.0588, "Africa/Algiers", "DZD", "Arabic/French", 85000, 4.0, 12.0, 3.0, 156, 33, 42, "MEDIUM", ["Oil & Gas", "Manufacturing", "Construction"]),

  // ===== LIBYA =====
  r("Tripoli", "Libya", "Tripoli", 32.8872, 13.1913, "Africa/Tripoli", "LYD", "Arabic", 6000, 2.5, 18.0, 3.0, 186, 17, 30, "SMALL", ["Oil & Gas", "Services"]),

  // ===== SENEGAL =====
  r("Dakar", "Senegal", "Dakar", 14.7167, -17.4677, "Africa/Dakar", "XOF", "French", 4000, 5.0, 8.0, 5.5, 123, 43, 40, "SMALL", ["Fishing", "Tourism", "Technology"]),

  // ===== IVORY COAST =====
  r("Abidjan", "Ivory Coast", "Lagunes", 5.36, -4.0083, "Africa/Abidjan", "XOF", "French", 4500, 4.5, 3.5, 6.5, 150, 35, 38, "MEDIUM", ["Agriculture", "Finance", "Manufacturing"]),

  // ===== CAMEROON =====
  r("Douala", "Cameroon", "Littoral", 4.0511, 9.7679, "Africa/Douala", "XAF", "French/English", 3500, 3.5, 4.5, 5.5, 160, 25, 32, "SMALL", ["Oil & Gas", "Manufacturing", "Port"]),

  // ===== UGANDA =====
  r("Kampala", "Uganda", "Central", 0.3476, 32.5825, "Africa/Kampala", "UGX", "English/Swahili", 2500, 3.5, 9.5, 10.0, 116, 26, 38, "SMALL", ["Agriculture", "Technology", "Services"]),

  // ===== RWANDA =====
  r("Kigali", "R Rwanda", "Kigali", -1.9403, 29.8739, "Africa/Kigali", "RWF", "English/French/Kinyarwanda", 2800, 2.5, 4.0, 7.0, 38, 53, 55, "SMALL", ["Technology", "Tourism", "Finance"]),

  // ===== ZIMBABWE =====
  r("Harare", "Zimbabwe", "Harare", -17.8252, 31.0335, "Africa/Harare", "ZWL", "English", 3000, 100.0, 5.0, 200.0, 140, 23, 30, "SMALL", ["Mining", "Agriculture", "Services"]),

  // ===== ZAMBIA =====
  r("Lusaka", "Zambia", "Lusaka", -15.3875, 28.3228, "Africa/Lusaka", "ZMW", "English", 3500, 9.0, 12.0, 12.5, 155, 33, 35, "SMALL", ["Mining", "Agriculture", "Construction"]),

  // ===== MOZAMBIQUE =====
  r("Maputo", "Mozambique", "Maputo", -25.9692, 32.5732, "Africa/Maputo", "MZN", "Portuguese", 3000, 7.0, 3.5, 17.25, 138, 26, 28, "SMALL", ["Coal", "Gas", "Agriculture"]),

  // ===== ANGOLA =====
  r("Luanda", "Angola", "Luanda", -8.839, 13.2894, "Africa/Luanda", "AOA", "Portuguese", 5000, 10.0, 30.0, 18.0, 132, 29, 35, "MEDIUM", ["Oil & Gas", "Mining", "Construction"]),

  // ===== SUDAN =====
  r("Khartoum", "Sudan", "Khartoum", 15.5007, 32.5599, "Africa/Khartoum", "SDG", "Arabic/English", 3500, 60.0, 18.0, 27.0, 151, 16, 22, "SMALL", ["Agriculture", "Oil", "Services"]),

  // ===== NEPAL =====
  r("Pokhara", "Nepal", "Gandaki", 28.2096, 83.9856, "Asia/Kathmandu", "NPR", "Nepali", 2800, 7.0, 5.0, 7.0, 100, 32, 30, "SMALL", ["Tourism", "Agriculture"]),

  // ===== MYANMAR (more) =====
  r("Mandalay", "Myanmar", "Mandalay", 21.9588, 96.0891, "Asia/Yangon", "MMK", "Burmese", 2500, 7.5, 2.5, 7.0, 170, 24, 22, "SMALL", ["Manufacturing", "Trade", "Agriculture"]),

  // ===== PAPUA NEW GUINEA =====
  r("Port Moresby", "Papua New Guinea", "NCD", -6.3149, 143.9555, "Pacific/Port_Moresby", "PGK", "English/TK", 6500, 5.0, 2.5, 6.25, 120, 28, 25, "SMALL", ["Mining", "Gas", "Agriculture"]),

  // ===== FIJI =====
  r("Suva", "Fiji", "Central", -18.1416, 178.4419, "Pacific/Fiji", "FJD", "English/Fijian", 8000, 3.0, 4.5, 0.25, 55, 50, 55, "SMALL", ["Tourism", "Sugar", "Garments"]),

  // ===== TONGA =====
  r("Nuku'alofa", "Tonga", "Tongatapu", -21.2087, -175.1982, "Pacific/Tongatapu", "TOP", "Tongan/English", 6000, 3.5, 2.0, 6.0, 50, 55, 40, "SMALL", ["Agriculture", "Fishing", "Tourism"]),

  // ===== SAMOA =====
  r("Apia", "Samoa", "Tuamasaga", -13.8333, -171.75, "Pacific/Apia", "WST", "Samoan/English", 5500, 3.0, 3.5, 6.0, 45, 52, 42, "SMALL", ["Agriculture", "Fishing", "Tourism"]),

  // ===== VANUATU =====
  r("Port Vila", "Vanuatu", "Shefa", -17.7334, 168.322, "Pacific/Efate", "VUV", "Bislama/English/French", 5000, 3.0, 5.0, 5.5, 65, 48, 35, "SMALL", ["Agriculture", "Tourism", "Fishing"]),

  // ===== SOLOMON ISLANDS =====
  r("Honiara", "Solomon Islands", "Central", -9.428, 159.9557, "Pacific/Guadalcanal", "SBD", "English", 4000, 3.5, 3.0, 7.0, 75, 30, 28, "SMALL", ["Agriculture", "Fishing", "Forestry"]),
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
  const c = region.country;

  if (c === "UAE") considerations.push("No personal income tax", "9% corporate tax (above AED 375K)", "VAT at 5%");
  else if (c === "India") considerations.push("GST at 5-28%", "Corporate tax 25-30%", "TDS requirements");
  else if (c === "USA") considerations.push("Federal + State tax", "Corporate tax 21%+", "Sales tax varies by state");
  else if (c === "UK") considerations.push("VAT at 20%", "Corporation tax 25%", "PAYE for employees");
  else if (c === "Singapore") considerations.push("No capital gains tax", "Corporate tax 17%", "GST at 9%");
  else if (c === "Germany") considerations.push("VAT at 19%", "Corporate tax ~30%", "Solidarity surcharge");
  else if (c === "France") considerations.push("VAT at 20%", "Corporate tax 25%", "Social charges ~45%");
  else if (c === "Japan") considerations.push("Corporate tax ~30%", "Consumption tax 10%", "Withholding tax applies");
  else if (c === "China") considerations.push("VAT at 6-13%", "Corporate tax 25%", "Withholding tax on dividends");
  else if (c === "Australia") considerations.push("GST at 10%", "Corporate tax 25-30%", "PAYG withholding");
  else if (c === "Canada") considerations.push("GST/HST 5-15%", "Corporate tax 12-31%", "Provincial taxes apply");
  else if (c === "Brazil") considerations.push("ICMS/ISS/PIS/COFINS", "Corporate tax 34%", "Complex tax system");
  else if (c === "Saudi Arabia") considerations.push("No personal income tax", "Zakat 2.5%", "VAT at 15%");
  else if (c === "Turkey") considerations.push("VAT at 20%", "Corporate tax 25%", "Withholding tax varies");
  else if (c === "South Korea") considerations.push("VAT at 10%", "Corporate tax 9-24%", "Local surtaxes");
  else if (c === "Switzerland") considerations.push("VAT at 8.1%", "Corporate tax 12-24%", "Cantonal variations");
  else if (c === "Netherlands") considerations.push("VAT at 21%", "Corporate tax 25.8%", "Innovation box regime");
  else if (c === "Sweden") considerations.push("VAT at 25%", "Corporate tax 20.6%", "No withholding on dividends");
  else if (c === "Norway") considerations.push("VAT at 25%", "Corporate tax 22%", "Petroleum tax 78%");
  else if (c === "Italy") considerations.push("VAT at 22%", "Corporate tax 24% + IRES 3.9%", "IRAP regional tax");
  else if (c === "Spain") considerations.push("VAT at 21%", "Corporate tax 25%", "Regional taxes vary");
  else if (c === "Poland") considerations.push("VAT at 23%", "Corporate tax 19%", "Citizenship tax for residents");
  else if (c === "Indonesia") considerations.push("VAT at 11%", "Corporate tax 22%", "Withholding tax applies");
  else if (c === "Thailand") considerations.push("VAT at 7%", "Corporate tax 20%", "Withholding tax varies");
  else if (c === "Vietnam") considerations.push("VAT at 8-10%", "Corporate tax 20%", "Foreign contractor tax");
  else if (c === "Malaysia") considerations.push("SST 6-10%", "Corporate tax 24%", "No capital gains tax");
  else if (c === "Philippines") considerations.push("VAT at 12%", "Corporate tax 25%", "Withholding tax applies");
  else if (c === "Nigeria") considerations.push("VAT at 7.5%", "Corporate tax 30%", "Educational tax");
  else if (c === "South Africa") considerations.push("VAT at 15%", "Corporate tax 28%", "Dividends tax 20%");
  else if (c === "Egypt") considerations.push("VAT at 14%", "Corporate tax 22.5%", "Withholding tax applies");
  else if (c === "Israel") considerations.push("VAT at 17%", "Corporate tax 23%", "Innovation incentives");
  else if (c === "Ireland") considerations.push("VAT at 23%", "Corporate tax 12.5%", "Knowledge development box");
  else if (c === "Mexico") considerations.push("IVA at 16%", "Corporate tax 30%", "Ley ISAN for large taxpayers");
  else if (c === "Argentina") considerations.push("VAT at 21%", "Corporate tax 35%", "Complex tax regime");
  else if (c === "Chile") considerations.push("IVA at 19%", "Corporate tax 27%", "Pro-Pyme incentives");
  else if (c === "Colombia") considerations.push("IVA at 19%", "Corporate tax 35%", "Renta anticipada");
  else if (c === "Pakistan") considerations.push("GST 17%", "Corporate tax 29%", "Withholding tax regime");
  else if (c === "Bangladesh") considerations.push("VAT 15%", "Corporate tax 27.5%", "Tax holiday available");
  else if (c === "Kenya") considerations.push("VAT 16%", "Corporate tax 30%", "Withholding tax applies");
  else if (c === "Ethiopia") considerations.push("VAT 15%", "Corporate tax 30%", "Withholding tax 3-10%");
  else if (c === "Morocco") considerations.push("VAT 20%", "Corporate tax 31%", "Reduced rates for SMEs");
  else if (c === "Qatar") considerations.push("No income tax", "10% withholding on some payments", "No VAT");
  else if (c === "Kuwait") considerations.push("No personal income tax", "15% withholding on some payments", "No corporate tax for locals");
  else if (c === "Bahrain") considerations.push("15% corporate tax (foreign)", "No personal tax", "No VAT");
  else if (c === "Oman") considerations.push("15% corporate tax", "No personal tax", "5% VAT");
  else considerations.push("Tax laws vary", "Consult local advisor", "Check bilateral treaties");

  return considerations;
}

export async function getRegionData(regionId: string): Promise<RegionalData | null> {
  const region = getRegionById(regionId);
  if (!region) return null;

  const indicators: RegionalIndicator[] = [
    { name: "GDP Per Capita", value: region.economicProfile.gdpPerCapita, unit: region.currency, change: 2.5, period: "2024", source: "economic_profile" },
    { name: "Inflation Rate", value: region.economicProfile.inflationRate, unit: "%", change: -0.3, period: "2024", source: "economic_profile" },
    { name: "Unemployment Rate", value: region.economicProfile.unemploymentRate, unit: "%", change: -0.1, period: "2024", source: "economic_profile" },
    { name: "Ease of Doing Business", value: region.economicProfile.easeOfDoingBusiness, unit: "rank", change: 2, period: "2024", source: "world_bank" },
    { name: "Digital Readiness", value: region.economicProfile.digitalReadiness, unit: "score", change: 3.5, period: "2024", source: "computed" },
  ];

  return { region: region.name, country: region.country, coordinates: region.coordinates, indicators, lastUpdated: new Date() };
}
