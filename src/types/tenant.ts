export interface TenantBranding {
  name: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
}

export interface TenantFeatures {
  financialEngine: boolean;
  dataBackbone: boolean;
  aiSandbox: boolean;
  compliance: boolean;
  studio: boolean;
  collaborative: boolean;
  pricing: boolean;
  customModules: string[];
}

export interface TenantCompliance {
  jurisdiction: string;
  regulations: string[];
  customRules: ComplianceRule[];
}

export interface ComplianceRule {
  id: string;
  name: string;
  category: string;
  requirement: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface TenantDeployment {
  domain: string;
  subdomain: string;
  linuxPath: string;
  port: number;
}

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  type: "school" | "company" | "institution" | "government" | "organization";
  branding: TenantBranding;
  features: TenantFeatures;
  compliance: TenantCompliance;
  deployment: TenantDeployment;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_TENANT: TenantConfig = {
  id: "default",
  name: "VentureForge",
  slug: "ventureforge",
  type: "organization",
  branding: {
    name: "VentureForge",
    tagline: "AI Business Planning Platform",
    logoUrl: "/logo.svg",
    faviconUrl: "/favicon.ico",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    accentColor: "#06b6d4",
    background: "#000000",
    surface: "#0a0a0a",
    foreground: "#ededed",
    muted: "#6b7280",
  },
  features: {
    financialEngine: true,
    dataBackbone: true,
    aiSandbox: true,
    compliance: true,
    studio: true,
    collaborative: true,
    pricing: true,
    customModules: [],
  },
  compliance: {
    jurisdiction: "international",
    regulations: [],
    customRules: [],
  },
  deployment: {
    domain: "ventureforge.app",
    subdomain: "",
    linuxPath: "/opt/ventureforge",
    port: 3000,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
