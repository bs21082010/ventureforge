import { dataCache } from "./cache";

const IMF_BASE = "https://www.imf.org/external/datamapper/api/v1";
const TIMEOUT_MS = 10_000;
const CACHE_TTL = 3_600_000;

export interface IMFDataPoint {
  year: number;
  value: number;
  indicator: string;
  country: string;
  countryISO: string;
}

export interface IMFIndicatorMeta {
  id: string;
  name: string;
  description: string;
  unit: string;
}

async function imfFetch<T>(path: string): Promise<T> {
  const url = `${IMF_BASE}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`IMF API ${res.status}: ${res.statusText}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

interface IMFResponse {
  datasets: Record<string, unknown>;
  values: Record<string, Record<string, Record<string, string | number>>>;
}

export async function getIMFIndicator(
  indicatorCode: string,
  countryISO: string,
  startYear: number,
  endYear: number
): Promise<IMFDataPoint[]> {
  const cacheKey = `imf:${indicatorCode}:${countryISO}:${startYear}:${endYear}`;
  const cached = dataCache.get(cacheKey);
  if (cached) return JSON.parse(cached.value);

  try {
    const data = await imfFetch<IMFResponse>(`/${indicatorCode}/${countryISO}`);

    if (!data?.values?.[indicatorCode]) return [];

    const countryData = data.values[indicatorCode][countryISO] || {};
    const points: IMFDataPoint[] = [];

    for (const [yearStr, value] of Object.entries(countryData)) {
      const year = parseInt(yearStr, 10);
      if (year >= startYear && year <= endYear && value !== null && value !== "") {
        const numVal = typeof value === "number" ? value : parseFloat(String(value));
        if (!isNaN(numVal)) {
          points.push({
            year,
            value: numVal,
            indicator: indicatorCode,
            country: countryISO,
            countryISO,
          });
        }
      }
    }

    points.sort((a, b) => a.year - b.year);
    dataCache.set(cacheKey, points, CACHE_TTL);
    return points;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error(`IMF request timed out for ${indicatorCode}/${countryISO}`);
    }
    console.error(`IMF API error for ${indicatorCode}/${countryISO}:`, err);
    return [];
  }
}

interface IMFIndicatorsResponse {
  indicators: Record<string, { label: string; description: string; unit: string }>;
}

export async function getIMFIndicators(): Promise<IMFIndicatorMeta[]> {
  const cacheKey = "imf:indicators:all";
  const cached = dataCache.get(cacheKey);
  if (cached) return JSON.parse(cached.value);

  try {
    const data = await imfFetch<IMFIndicatorsResponse>("/indicators");

    if (!data?.indicators) return [];

    const indicators: IMFIndicatorMeta[] = Object.entries(data.indicators).map(
      ([id, meta]) => ({
        id,
        name: meta.label ?? id,
        description: meta.description ?? "",
        unit: meta.unit ?? "",
      })
    );

    dataCache.set(cacheKey, indicators, CACHE_TTL);
    return indicators;
  } catch (err) {
    console.error("IMF indicators API error:", err);
    return [];
  }
}

export async function getIMFCountries(): Promise<{ iso: string; name: string }[]> {
  const cacheKey = "imf:countries:all";
  const cached = dataCache.get(cacheKey);
  if (cached) return JSON.parse(cached.value);

  try {
    const data = await imfFetch<{ countries: Record<string, { label: string }> }>("/countries");

    if (!data?.countries) return [];

    const countries = Object.entries(data.countries).map(([iso, meta]) => ({
      iso,
      name: meta.label ?? iso,
    }));

    dataCache.set(cacheKey, countries, CACHE_TTL);
    return countries;
  } catch (err) {
    console.error("IMF countries API error:", err);
    return [];
  }
}
