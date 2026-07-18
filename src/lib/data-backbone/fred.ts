import { dataCache } from "./cache";

const FRED_BASE = "https://api.stlouisfed.org/fred";
const TIMEOUT_MS = 10_000;
const CACHE_TTL = 3_600_000;

function getApiKey(): string {
  return process.env.FRED_API_KEY || "";
}

export interface FREDObservation {
  date: string;
  value: number;
  seriesId: string;
}

export interface FREDSeriesInfo {
  id: string;
  title: string;
  observationStart: string;
  observationEnd: string;
  frequency: string;
  seasonalAdjustment: string;
  notes: string;
}

async function fredFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("FRED_API_KEY is not configured");

  const url = new URL(`${FRED_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
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
    if (!res.ok) throw new Error(`FRED API ${res.status}: ${res.statusText}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

interface FREDObservationsResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  observations: Array<{
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }>;
}

export async function getFREDSeries(
  seriesId: string,
  startDate: string,
  endDate: string
): Promise<FREDObservation[]> {
  const cacheKey = `fred:${seriesId}:${startDate}:${endDate}`;
  const cached = dataCache.get(cacheKey);
  if (cached) return JSON.parse(cached.value);

  try {
    const data = await fredFetch<FREDObservationsResponse>("/series/observations", {
      series_id: seriesId,
      observation_start: startDate,
      observation_end: endDate,
    });

    if (!data?.observations) return [];

    const observations: FREDObservation[] = data.observations
      .filter((o) => o.value !== ".")
      .map((o) => ({
        date: o.date,
        value: parseFloat(o.value),
        seriesId,
      }));

    dataCache.set(cacheKey, observations, CACHE_TTL);
    return observations;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error(`FRED request timed out for series ${seriesId}`);
    }
    console.error(`FRED API error for series ${seriesId}:`, err);
    return [];
  }
}

interface FREDSeriesResponse {
  realtime_start: string;
  realtime_end: string;
  seriestype: string;
  id: string;
  title: string;
  observation_start: string;
  observation_end: string;
  frequency: string;
  frequency_short: string;
  units: string;
  units_short: string;
  seasonal_adjustment: string;
  seasonal_adjustment_short: string;
  notes: string;
}

export async function getFREDSeriesInfo(seriesId: string): Promise<FREDSeriesInfo | null> {
  const cacheKey = `fred:info:${seriesId}`;
  const cached = dataCache.get(cacheKey);
  if (cached) return JSON.parse(cached.value);

  try {
    const data = await fredFetch<FREDSeriesResponse>("/series", {
      series_id: seriesId,
    });

    const info: FREDSeriesInfo = {
      id: data.id,
      title: data.title,
      observationStart: data.observation_start,
      observationEnd: data.observation_end,
      frequency: data.frequency,
      seasonalAdjustment: data.seasonal_adjustment,
      notes: data.notes ?? "",
    };

    dataCache.set(cacheKey, info, CACHE_TTL);
    return info;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error(`FRED info request timed out for series ${seriesId}`);
    }
    console.error(`FRED series info error for ${seriesId}:`, err);
    return null;
  }
}
