import type { DataSource, DataSourceType, DataPoint } from "@/types/data";
import { getWorldBankIndicator, getWorldBankCountries } from "./worldbank";
import { getIMFIndicator } from "./imf";
import { getFREDSeries } from "./fred";

export type DataSourceStatus = "active" | "degraded" | "offline" | "mock";

export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  baseUrl: string;
  documentationUrl: string;
  endpoints: Record<string, string>;
  auth?: { type: "api_key" | "oauth2"; key: string };
  refreshRate: number;
}

export const GOVERNMENT_DATA_SOURCES: DataSourceConfig[] = [
  {
    id: "world_bank",
    name: "World Bank Open Data",
    type: "GOVERNMENT_ECONOMIC",
    baseUrl: "https://api.worldbank.org/v2",
    documentationUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structure",
    endpoints: {
      indicators: "/indicator",
      countries: "/country",
      gdp: "/indicator/NY.GDP.MKTP.CD",
      inflation: "/indicator/FP.CPI.TOTL.ZG",
      population: "/indicator/SP.POP.TOTL",
      unemployment: "/indicator/SL.UEM.TOTL.ZS",
    },
    refreshRate: 86400,
  },
  {
    id: "imf_data",
    name: "IMF Economic Data",
    type: "GOVERNMENT_ECONOMIC",
    baseUrl: "https://www.imf.org/external/datamapper/api/v1",
    documentationUrl: "https://www.imf.org/external/datamapper",
    endpoints: {
      gdp_growth: "/NGDP_RPCH",
      inflation: "/PCPIPCH",
      current_account: "/BCA_NGDPD",
      fiscal_balance: "/GGX_NGDP",
    },
    refreshRate: 86400,
  },
  {
    id: "census_bureau",
    name: "US Census Bureau",
    type: "DEMOGRAPHIC",
    baseUrl: "https://api.census.gov/data",
    documentationUrl: "https://www.census.gov/data/developers.html",
    endpoints: {
      population: "/acs/acs1",
      income: "/acs/acs1/acs1sf3",
      business: "/ecn/bds",
    },
    refreshRate: 86400,
  },
  {
    id: "fred",
    name: "Federal Reserve Economic Data",
    type: "MARKET_DATA",
    baseUrl: "https://api.stlouisfed.org/fred/series/observations",
    documentationUrl: "https://fred.stlouisfed.org/docs/api/fred/",
    endpoints: {
      interest_rates: "/DFEDTARU",
      inflation_rate: "/CPIAUCSL",
      unemployment: "/UNRATE",
      gdp: "/GDP",
    },
    auth: { type: "api_key", key: process.env.FRED_API_KEY || "" },
    refreshRate: 3600,
  },
];

export const INDUSTRY_DATA_SOURCES: DataSourceConfig[] = [
  {
    id: "statista",
    name: "Statista Industry Data",
    type: "INDUSTRY_REPORT",
    baseUrl: "https://api.statista.com/v1",
    documentationUrl: "https://developer.statista.com/",
    endpoints: {
      market_size: "/markets",
      forecasts: "/forecasts",
    },
    refreshRate: 604800,
  },
  {
    id: "google_trends",
    name: "Google Trends",
    type: "MARKET_DATA",
    baseUrl: "https://trends.google.com/trends/api",
    documentationUrl: "https://github.com/GeneralMills/pytrends",
    endpoints: {
      explore: "/explore",
      compare: "/compare",
    },
    refreshRate: 86400,
  },
];

const ALL_SOURCES = [...GOVERNMENT_DATA_SOURCES, ...INDUSTRY_DATA_SOURCES];

export async function getSourceStatus(
  sourceId: string
): Promise<DataSourceStatus> {
  const source = ALL_SOURCES.find((s) => s.id === sourceId);
  if (!source) return "offline";

  if (source.auth?.type === "api_key" && !source.auth.key) {
    return source.id === "fred" ? "degraded" : "mock";
  }

  return "active";
}

export async function getAllSourceStatuses(): Promise<
  Record<string, DataSourceStatus>
> {
  const statuses: Record<string, DataSourceStatus> = {};
  for (const source of ALL_SOURCES) {
    statuses[source.id] = await getSourceStatus(source.id);
  }
  return statuses;
}

export async function fetchFromSource(
  sourceId: string,
  indicator: string,
  countryISO: string,
  startYear: number,
  endYear: number
): Promise<DataPoint[]> {
  switch (sourceId) {
    case "world_bank":
      return fetchWorldBankSource(indicator, countryISO, startYear, endYear);
    case "imf_data":
      return fetchIMFSource(indicator, countryISO, startYear, endYear);
    case "fred":
      return fetchFREDSource(indicator, startYear, endYear);
    default:
      console.warn(`No real API client for source: ${sourceId}`);
      return [];
  }
}

async function fetchWorldBankSource(
  indicator: string,
  countryISO: string,
  startYear: number,
  endYear: number
): Promise<DataPoint[]> {
  const raw = await getWorldBankIndicator(indicator, countryISO, startYear, endYear);
  return raw.map((p) => ({
    key: `worldbank_${p.indicator}_${p.countryISO}_${p.year}`,
    value: p.value,
    timestamp: new Date(p.year, 0),
    source: "world_bank",
    confidence: 0.95,
  }));
}

async function fetchIMFSource(
  indicator: string,
  countryISO: string,
  startYear: number,
  endYear: number
): Promise<DataPoint[]> {
  const raw = await getIMFIndicator(indicator, countryISO, startYear, endYear);
  return raw.map((p) => ({
    key: `imf_${p.indicator}_${p.countryISO}_${p.year}`,
    value: p.value,
    timestamp: new Date(p.year, 0),
    source: "imf_data",
    confidence: 0.93,
  }));
}

async function fetchFREDSource(
  seriesId: string,
  startYear: number,
  endYear: number
): Promise<DataPoint[]> {
  const raw = await getFREDSeries(
    seriesId,
    `${startYear}-01-01`,
    `${endYear}-12-31`
  );
  return raw.map((p) => ({
    key: `fred_${p.seriesId}_${p.date}`,
    value: p.value,
    timestamp: new Date(p.date),
    source: "fred",
    confidence: 0.98,
  }));
}

export async function fetchFromDataSource(
  source: DataSourceConfig,
  endpoint: string,
  params?: Record<string, string>
): Promise<DataPoint[]> {
  const url = new URL(`${source.baseUrl}${source.endpoints[endpoint]}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  if (source.auth?.type === "api_key") {
    url.searchParams.set("api_key", source.auth.key);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(source.auth?.type === "api_key"
          ? { Authorization: `Bearer ${source.auth.key}` }
          : {}),
      },
      next: { revalidate: source.refreshRate },
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return normalizeDataPoints(data, source.id);
  } catch (error) {
    console.error(`Error fetching from ${source.name}:`, error);
    return [];
  }
}

function normalizeDataPoints(
  raw: unknown,
  sourceId: string
): DataPoint[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.map((item, index) => ({
      key: `${sourceId}_${index}`,
      value: item.value ?? item,
      unit: item.unit,
      timestamp: new Date(item.date || item.timestamp || Date.now()),
      source: sourceId,
      confidence: item.confidence ?? 0.9,
    }));
  }

  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    return Object.entries(obj).map(([key, value]) => ({
      key: `${sourceId}_${key}`,
      value,
      timestamp: new Date(),
      source: sourceId,
      confidence: 0.9,
    }));
  }

  return [];
}

export async function getRegionalEconomicIndicators(
  country: string
): Promise<DataPoint[]> {
  const results: DataPoint[] = [];

  for (const source of GOVERNMENT_DATA_SOURCES) {
    try {
      const endpoints = Object.keys(source.endpoints);
      for (const endpoint of endpoints.slice(0, 2)) {
        const points = await fetchFromDataSource(source, endpoint, {
          country,
          format: "json",
          per_page: "50",
        });
        results.push(...points);
      }
    } catch {
      continue;
    }
  }

  return results;
}
