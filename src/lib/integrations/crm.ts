import type { IntegrationType } from "@/types/compliance";

export interface IntegrationAdapter {
  type: IntegrationType;
  name: string;
  description: string;
  capabilities: string[];
  authType: "api_key" | "oauth2" | "basic";
  connect: (config: Record<string, string>) => Promise<IntegrationStatus>;
  sync: (planId: string, config: Record<string, string>) => Promise<SyncResult>;
  disconnect: (config: Record<string, string>) => Promise<void>;
}

export interface IntegrationStatus {
  connected: boolean;
  lastSync?: Date;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  errors: string[];
  timestamp: Date;
}

const BASE_ADAPTERS: Omit<IntegrationAdapter, "connect" | "sync" | "disconnect">[] = [
  {
    type: "CRM_SALESFORCE",
    name: "Salesforce CRM",
    description: "Sync business plans with Salesforce opportunities, accounts, and contacts.",
    capabilities: ["contacts", "accounts", "opportunities", "campaigns"],
    authType: "oauth2",
  },
  {
    type: "CRM_HUBSPOT",
    name: "HubSpot CRM",
    description: "Connect with HubSpot for marketing automation and contact management.",
    capabilities: ["contacts", "companies", "deals", "marketing_events"],
    authType: "oauth2",
  },
  {
    type: "ERP_SAP",
    name: "SAP Business One",
    description: "Integrate with SAP for financial data, inventory, and operations.",
    capabilities: ["financials", "inventory", "orders", "production"],
    authType: "api_key",
  },
  {
    type: "ERP_ORACLE",
    name: "Oracle NetSuite",
    description: "Connect to NetSuite ERP for comprehensive business management.",
    capabilities: ["financials", "crm", "inventory", "hr"],
    authType: "oauth2",
  },
  {
    type: "ACCOUNTING_QUICKBOOKS",
    name: "QuickBooks",
    description: "Sync financial projections with QuickBooks accounting data.",
    capabilities: ["invoices", "expenses", "reports", "payroll"],
    authType: "oauth2",
  },
  {
    type: "ACCOUNTING_XERO",
    name: "Xero",
    description: "Connect with Xero for real-time financial data and reporting.",
    capabilities: ["invoices", "bank_feeds", "reports", "contacts"],
    authType: "oauth2",
  },
  {
    type: "CLOUD_GOOGLE_DRIVE",
    name: "Google Drive",
    description: "Store and sync business plans with Google Drive.",
    capabilities: ["files", "folders", "sharing", "version_history"],
    authType: "oauth2",
  },
  {
    type: "CLOUD_ONEDRIVE",
    name: "Microsoft OneDrive",
    description: "Integrate with OneDrive for document storage and collaboration.",
    capabilities: ["files", "folders", "sharing", "version_history"],
    authType: "oauth2",
  },
  {
    type: "CLOUD_DROPBOX",
    name: "Dropbox",
    description: "Sync business plan documents with Dropbox.",
    capabilities: ["files", "folders", "sharing", "version_history"],
    authType: "oauth2",
  },
];

async function defaultConnect(
  config: Record<string, string>
): Promise<IntegrationStatus> {
  if (!config.apiKey && !config.accessToken) {
    return { connected: false, error: "Missing authentication credentials" };
  }
  return { connected: true, lastSync: new Date() };
}

async function defaultSync(
  planId: string,
  config: Record<string, string>
): Promise<SyncResult> {
  return {
    success: true,
    recordsSynced: 0,
    errors: [],
    timestamp: new Date(),
  };
}

async function defaultDisconnect(
  config: Record<string, string>
): Promise<void> {
  return;
}

export const INTEGRATION_ADAPTERS: IntegrationAdapter[] = BASE_ADAPTERS.map(
  (adapter) => ({
    ...adapter,
    connect: defaultConnect,
    sync: defaultSync,
    disconnect: defaultDisconnect,
  })
);

export function getAdapterByType(
  type: IntegrationType
): IntegrationAdapter | undefined {
  return INTEGRATION_ADAPTERS.find((a) => a.type === type);
}

export function getAvailableIntegrations(): IntegrationAdapter[] {
  return INTEGRATION_ADAPTERS;
}
