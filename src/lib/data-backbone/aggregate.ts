import { getWorldBankIndicator } from "./worldbank";
import { getIMFIndicator } from "./imf";
import { getFREDSeries } from "./fred";

export interface UnifiedDataPoint {
  source: "worldbank" | "imf" | "fred";
  indicator: string;
  country: string;
  countryISO: string;
  year: number;
  value: number;
}

const WB_TO通用_INDICATOR: Record<string, string> = {
  "NY.GDP.MKTP.CD": "gdp",
  "FP.CPI.TOTL.ZG": "inflation",
  "SP.POP.TOTL": "population",
  "SL.UEM.TOTL.ZS": "unemployment",
  "NY.GDP.PCAP.CD": "gdp_per_capita",
  "FR.INR.RINR": "interest_rate",
  "NE.EXP.GNFS.ZS": "exports_pct_gdp",
  "BN.CAB.XOKA.GD.ZS": "current_account_pct_gdp",
};

const IMF_INDICATOR_MAP: Record<string, string> = {
  NGDP_RPCH: "gdp_growth",
  PCPIPCH: "inflation",
  BCA_NGDPD: "current_account_pct_gdp",
  GGX_NGDP: "fiscal_balance_pct_gdp",
  LEXPTotal: "life_expectancy",
  LE: "life_expectancy",
};

const FRED_SERIES_MAP: Record<string, string> = {
  DFEDTARU: "federal_funds_rate",
  CPIAUCSL: "cpi_inflation",
  UNRATE: "unemployment",
  GDP: "gdp",
  GDPDEF: "gdp_deflator",
};

const COUNTRY_ISO_TO_FRED_PREFIX: Record<string, string> = {
  US: "US",
};

export async function getRegionalData(
  regionISO: string,
  indicators: string[],
  years: number[]
): Promise<UnifiedDataPoint[]> {
  const startYear = Math.min(...years);
  const endYear = Math.max(...years);
  const yearSet = new Set(years);
  const results: UnifiedDataPoint[] = [];

  const fetchPromises: Promise<void>[] = [];

  for (const indicator of indicators) {
    fetchPromises.push(
      fetchWorldBank(indicator, regionISO, startYear, endYear, yearSet).then(
        (points) => { results.push(...points); }
      )
    );

    fetchPromises.push(
      fetchIMF(indicator, regionISO, startYear, endYear, yearSet).then(
        (points) => { results.push(...points); }
      )
    );

    fetchPromises.push(
      fetchFRED(indicator, regionISO, startYear, endYear).then(
        (points) => { results.push(...points); }
      )
    );
  }

  await Promise.allSettled(fetchPromises);
  return results;
}

export async function getCountryComparison(
  countryISOs: string[],
  indicator: string,
  years: number[]
): Promise<UnifiedDataPoint[]> {
  const startYear = Math.min(...years);
  const endYear = Math.max(...years);
  const yearSet = new Set(years);
  const results: UnifiedDataPoint[] = [];

  const fetchPromises: Promise<void>[] = [];

  for (const iso of countryISOs) {
    fetchPromises.push(
      fetchWorldBank(indicator, iso, startYear, endYear, yearSet).then(
        (points) => { results.push(...points); }
      )
    );

    fetchPromises.push(
      fetchIMF(indicator, iso, startYear, endYear, yearSet).then(
        (points) => { results.push(...points); }
      )
    );

    fetchPromises.push(
      fetchFRED(indicator, iso, startYear, endYear).then(
        (points) => { results.push(...points); }
      )
    );
  }

  await Promise.allSettled(fetchPromises);
  return results;
}

async function fetchWorldBank(
  indicator: string,
  countryISO: string,
  startYear: number,
  endYear: number,
  yearSet: Set<number>
): Promise<UnifiedDataPoint[]> {
  const wbCode = resolveWorldBankIndicator(indicator);
  if (!wbCode) return [];

  try {
    const raw = await getWorldBankIndicator(wbCode, countryISO, startYear, endYear);
    return raw
      .filter((p) => yearSet.has(p.year))
      .map((p) => ({
        source: "worldbank" as const,
        indicator: indicator,
        country: p.country,
        countryISO,
        year: p.year,
        value: p.value,
      }));
  } catch {
    return [];
  }
}

async function fetchIMF(
  indicator: string,
  countryISO: string,
  startYear: number,
  endYear: number,
  yearSet: Set<number>
): Promise<UnifiedDataPoint[]> {
  const imfCode = resolveIMFIndicator(indicator);
  if (!imfCode) return [];

  try {
    const raw = await getIMFIndicator(imfCode, countryISO, startYear, endYear);
    return raw
      .filter((p) => yearSet.has(p.year))
      .map((p) => ({
        source: "imf" as const,
        indicator: indicator,
        country: countryISO,
        countryISO,
        year: p.year,
        value: p.value,
      }));
  } catch {
    return [];
  }
}

async function fetchFRED(
  indicator: string,
  countryISO: string,
  startYear: number,
  endYear: number
): Promise<UnifiedDataPoint[]> {
  if (countryISO !== "US" && !COUNTRY_ISO_TO_FRED_PREFIX[countryISO]) return [];

  const fredCode = resolveFREDSeries(indicator);
  if (!fredCode) return [];

  try {
    const raw = await getFREDSeries(
      fredCode,
      `${startYear}-01-01`,
      `${endYear}-12-31`
    );
    return raw.map((p) => ({
      source: "fred" as const,
      indicator: indicator,
      country: "United States",
      countryISO,
      year: parseInt(p.date.split("-")[0], 10),
      value: p.value,
    }));
  } catch {
    return [];
  }
}

function resolveWorldBankIndicator(indicator: string): string | null {
  const normalized = indicator.toLowerCase().replace(/[\s-]/g, "_");

  for (const [code, name] of Object.entries(WB_TO通用_INDICATOR)) {
    if (name === normalized) return code;
  }

  if (indicator.includes(".") && indicator === indicator.toUpperCase()) {
    return indicator;
  }

  return null;
}

function resolveIMFIndicator(indicator: string): string | null {
  const normalized = indicator.toLowerCase().replace(/[\s-]/g, "_");

  for (const [code, name] of Object.entries(IMF_INDICATOR_MAP)) {
    if (name === normalized) return code;
  }

  if (indicator === indicator.toUpperCase() && indicator.length <= 15) {
    return indicator;
  }

  return null;
}

function resolveFREDSeries(indicator: string): string | null {
  const normalized = indicator.toLowerCase().replace(/[\s-]/g, "_");

  for (const [code, name] of Object.entries(FRED_SERIES_MAP)) {
    if (name === normalized) return code;
  }

  if (indicator === indicator.toUpperCase() && indicator.length <= 15) {
    return indicator;
  }

  return null;
}
