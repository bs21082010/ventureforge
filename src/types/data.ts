export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  url: string;
  refreshRate: number;
  isActive: boolean;
  lastFetched?: Date;
  metadata: Record<string, unknown>;
}

export type DataSourceType =
  | "GOVERNMENT_ECONOMIC"
  | "INDUSTRY_REPORT"
  | "MARKET_DATA"
  | "GEOGRAPHIC"
  | "DEMOGRAPHIC"
  | "REGULATORY"
  | "BLOCKCHAIN_VERIFIED";

export interface DataPoint {
  key: string;
  value: unknown;
  unit?: string;
  timestamp: Date;
  source: string;
  confidence: number;
}

export interface RegionalData {
  region: string;
  country: string;
  coordinates: { lat: number; lng: number };
  indicators: RegionalIndicator[];
  lastUpdated: Date;
}

export interface RegionalIndicator {
  name: string;
  value: number;
  unit: string;
  change: number; // % change
  period: string;
  source: string;
}

export interface DataCache {
  key: string;
  value: string;
  fetchedAt: Date;
  expiresAt: Date;
}

export interface BlockchainVerification {
  dataHash: string;
  blockNumber: number;
  timestamp: Date;
  verified: boolean;
  chain: string;
}
