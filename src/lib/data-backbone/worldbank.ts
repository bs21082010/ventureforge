import { dataCache } from "./cache";

const WB_BASE = "https://api.worldbank.org/v2";
const TIMEOUT_MS = 10_000;
const CACHE_TTL = 3_600_000;

export interface WorldBankDataPoint {
  year: number;
  value: number;
  indicator: string;
  country: string;
  countryISO: string;
}

interface WBMeta {
  page: number;
  pages: number;
  per_page: number;
  total: number;
}

interface WBObservation {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  date: string;
  value: string;
  decimal: number;
}

async function wbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${WB_BASE}${path}`);
  url.searchParams.set("format", "json");
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`World Bank API ${res.status}: ${res.statusText}`);
    const json = await res.json();
    if (Array.isArray(json) && json.length === 2) {
      return json[1] as T;
    }
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function getWorldBankIndicator(
  indicatorCode: string,
  countryISO: string,
  startYear: number,
  endYear: number
): Promise<WorldBankDataPoint[]> {
  const cacheKey = `wb:${indicatorCode}:${countryISO}:${startYear}:${endYear}`;
  const cached = dataCache.get(cacheKey);
  if (cached) return JSON.parse(cached.value);

  try {
    const observations = await wbFetch<WBObservation[]>(
      `/country/${countryISO}/indicator/${indicatorCode}`,
      {
        date: `${startYear}:${endYear}`,
        per_page: "500",
        source: "2",
      }
    );

    if (!Array.isArray(observations)) return [];

    const points: WorldBankDataPoint[] = observations
      .filter((o) => o.value !== null && o.value !== "")
      .map((o) => ({
        year: parseInt(o.date, 10),
        value: parseFloat(o.value),
        indicator: o.indicator.id,
        country: o.country.value,
        countryISO,
      }));

    dataCache.set(cacheKey, points, CACHE_TTL);
    return points;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error(`World Bank request timed out for ${indicatorCode}/${countryISO}`);
    }
    console.error(`World Bank API error for ${indicatorCode}/${countryISO}:`, err);
    return [];
  }
}

export interface WBCountry {
  iso2Code: string;
  iso3Code: string;
  name: string;
  region: string;
  incomeLevel: string;
  capitalCity: string;
  longitude: string;
  latitude: string;
}

interface WBCountryRaw {
  id: string;
  iso2Code: string;
  name: string;
  region: { id: string; value: string };
  incomeLevel: { id: string; value: string };
  capitalCity: string;
  longitude: string;
  latitude: string;
}

export async function getWorldBankCountries(): Promise<WBCountry[]> {
  const cacheKey = "wb:countries:all";
  const cached = dataCache.get(cacheKey);
  if (cached) return JSON.parse(cached.value);

  try {
    const raw = await wbFetch<WBCountryRaw[]>("/country", {
      per_page: "500",
      format: "json",
    });

    if (!Array.isArray(raw)) return [];

    const countries: WBCountry[] = raw
      .filter((c) => c.region && c.region.id !== "NA")
      .map((c) => ({
        iso2Code: c.iso2Code,
        iso3Code: c.id,
        name: c.name,
        region: c.region?.value ?? "",
        incomeLevel: c.incomeLevel?.value ?? "",
        capitalCity: c.capitalCity,
        longitude: c.longitude,
        latitude: c.latitude,
      }));

    dataCache.set(cacheKey, countries, CACHE_TTL);
    return countries;
  } catch (err) {
    console.error("World Bank countries API error:", err);
    return [];
  }
}

export interface WBIndicatorMeta {
  id: string;
  name: string;
  sourceNote: string;
  sourceOrganization: string;
}

interface WBIndicatorRaw {
  id: string;
  name: string;
  sourceNote: string;
  sourceOrganization: string;
}

export async function getWorldBankIndicators(): Promise<WBIndicatorMeta[]> {
  const cacheKey = "wb:indicators:all";
  const cached = dataCache.get(cacheKey);
  if (cached) return JSON.parse(cached.value);

  try {
    const raw = await wbFetch<WBIndicatorRaw[]>("/indicator", {
      per_page: "1000",
      format: "json",
    });

    if (!Array.isArray(raw)) return [];

    const indicators: WBIndicatorMeta[] = raw.map((i) => ({
      id: i.id,
      name: i.name,
      sourceNote: i.sourceNote ?? "",
      sourceOrganization: i.sourceOrganization ?? "",
    }));

    dataCache.set(cacheKey, indicators, CACHE_TTL);
    return indicators;
  } catch (err) {
    console.error("World Bank indicators API error:", err);
    return [];
  }
}
