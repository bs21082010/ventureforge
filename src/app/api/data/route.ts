import { NextRequest, NextResponse } from "next/server";
import { GOVERNMENT_DATA_SOURCES, INDUSTRY_DATA_SOURCES } from "@/lib/data-backbone/sources";
import { getRegionData, getRegionsByCountry } from "@/lib/geospatial/regions";
import { getWorldBankIndicator } from "@/lib/data-backbone/worldbank";
import { getIMFIndicator } from "@/lib/data-backbone/imf";

const ALL_SOURCES = [...GOVERNMENT_DATA_SOURCES, ...INDUSTRY_DATA_SOURCES].map((s) => ({
  id: s.id,
  name: s.name,
  type: s.type,
  isActive: true,
  lastFetched: new Date().toISOString(),
  refreshRate: s.refreshRate,
}));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");

  if (region) {
    const data = await getRegionData(region);
    if (!data) return NextResponse.json({ error: "Region not found" }, { status: 404 });

    // Enrich with real World Bank data
    try {
      const wbGDP = await getWorldBankIndicator("NY.GDP.MKTP.CD", region, 2020, 2024);
      return NextResponse.json({ data, worldBank: wbGDP });
    } catch {
      return NextResponse.json({ data });
    }
  }

  const country = searchParams.get("country");
  if (country) {
    const regions = getRegionsByCountry(country);
    const results = await Promise.all(regions.map((r) => getRegionData(r.id)));
    return NextResponse.json({ regions: results.filter(Boolean) });
  }

  return NextResponse.json({ sources: ALL_SOURCES });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, region = "IN", indicators = ["NY.GDP.MKTP.CD"], years = [2024] } = body || {};

    if (source === "world_bank") {
      const data = await getWorldBankIndicator(indicators[0], region, years[0], years[years.length - 1]);
      return NextResponse.json({ source: "world_bank", data, timestamp: new Date().toISOString() });
    }

    if (source === "imf_data") {
      const data = await getIMFIndicator(indicators[0], region, years[0], years[years.length - 1]);
      return NextResponse.json({ source: "imf_data", data, timestamp: new Date().toISOString() });
    }

    if (source === "fred") {
      // FRED needs API key
      if (!process.env.FRED_API_KEY || process.env.FRED_API_KEY === "your-fred-api-key") {
        return NextResponse.json({
          source: "fred",
          data: [],
          note: "FRED_API_KEY not configured. Get free key at https://fred.stlouisfed.org/docs/api/api_key.html",
          timestamp: new Date().toISOString(),
        });
      }
      const { getFREDSeries } = await import("@/lib/data-backbone/fred");
      const data = await getFREDSeries(indicators[0], `${years[0]}-01-01`, `${years[years.length - 1]}-12-31`);
      return NextResponse.json({ source: "fred", data, timestamp: new Date().toISOString() });
    }

    // Default: aggregate from World Bank with fallback
    const results = await Promise.allSettled(
      indicators.map((ind: string) => getWorldBankIndicator(ind, region, years[0], years[years.length - 1]))
    );

    const data = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getWorldBankIndicator>>> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    if (data.length === 0) {
      // Fallback: return known static data from our regions database
      const regionData = await getRegionData(region);
      if (regionData) {
        const name = regionData.region || region;
        const fallbackData = regionData.indicators.map((ind) => ({
          source: "cached" as const,
          indicator: ind.name,
          country: name,
          countryISO: region,
          year: parseInt(ind.period, 10) || 2024,
          value: ind.value,
        }));
        if (fallbackData.length > 0) {
          return NextResponse.json({
            source: "fallback",
            region,
            data: fallbackData,
            note: "External APIs unreachable — using cached regional data. Real APIs (World Bank, IMF, FRED) will auto-connect when network allows.",
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      source: "aggregate",
      region,
      data,
      sourcesUsed: ["world_bank"],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Data fetch failed" },
      { status: 500 }
    );
  }
}
