import { TenantConfig, DEFAULT_TENANT } from "@/types/tenant";

const tenantCache = new Map<string, TenantConfig>();

function resolveTenantSlug(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length > 2) return parts[0];
  }
  return process.env.TENANT_SLUG || "default";
}

export async function loadTenantConfig(slug?: string): Promise<TenantConfig> {
  const key = slug || resolveTenantSlug();

  if (tenantCache.has(key)) return tenantCache.get(key)!;

  try {
    const res = await fetch(`/api/tenant/${key}`);
    if (res.ok) {
      const config = await res.json();
      tenantCache.set(key, config);
      return config;
    }
  } catch {}

  try {
    const fs = await import("fs");
    const path = await import("path");
    const configPath = path.join(process.cwd(), "tenants", `${key}.json`);
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8");
      const config: TenantConfig = JSON.parse(raw);
      tenantCache.set(key, config);
      return config;
    }
  } catch {}

  const envConfig = getEnvTenantConfig();
  if (envConfig) {
    tenantCache.set(key, envConfig);
    return envConfig;
  }

  tenantCache.set("default", DEFAULT_TENANT);
  return DEFAULT_TENANT;
}

function getEnvTenantConfig(): TenantConfig | null {
  const name = process.env.TENANT_NAME;
  if (!name) return null;

  return {
    id: process.env.TENANT_ID || "env-tenant",
    name,
    slug: process.env.TENANT_SLUG || "default",
    type: (process.env.TENANT_TYPE as TenantConfig["type"]) || "organization",
    branding: {
      name,
      tagline: process.env.TENANT_TAGLINE || "",
      logoUrl: process.env.TENANT_LOGO_URL || "/logo.svg",
      faviconUrl: process.env.TENANT_FAVICON_URL || "/favicon.ico",
      primaryColor: process.env.TENANT_PRIMARY_COLOR || "#3b82f6",
      secondaryColor: process.env.TENANT_SECONDARY_COLOR || "#8b5cf6",
      accentColor: process.env.TENANT_ACCENT_COLOR || "#06b6d4",
      background: process.env.TENANT_BG_COLOR || "#000000",
      surface: process.env.TENANT_SURFACE_COLOR || "#0a0a0a",
      foreground: process.env.TENANT_FG_COLOR || "#ededed",
      muted: process.env.TENANT_MUTED_COLOR || "#6b7280",
    },
    features: {
      financialEngine: process.env.TENANT_FEATURE_FINANCIAL !== "false",
      dataBackbone: process.env.TENANT_FEATURE_DATA !== "false",
      aiSandbox: process.env.TENANT_FEATURE_AI !== "false",
      compliance: process.env.TENANT_FEATURE_COMPLIANCE !== "false",
      studio: process.env.TENANT_FEATURE_STUDIO !== "false",
      collaborative: process.env.TENANT_FEATURE_COLLABORATIVE !== "false",
      pricing: process.env.TENANT_FEATURE_PRICING !== "false",
      customModules: (process.env.TENANT_CUSTOM_MODULES || "").split(",").filter(Boolean),
    },
    compliance: {
      jurisdiction: process.env.TENANT_JURISDICTION || "international",
      regulations: (process.env.TENANT_REGULATIONS || "").split(",").filter(Boolean),
      customRules: [],
    },
    deployment: {
      domain: process.env.TENANT_DOMAIN || "localhost",
      subdomain: process.env.TENANT_SUBDOMAIN || "",
      linuxPath: process.env.TENANT_LINUX_PATH || "/opt/ventureforge",
      port: parseInt(process.env.PORT || "3000"),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function clearTenantCache(slug?: string) {
  if (slug) tenantCache.delete(slug);
  else tenantCache.clear();
}

export function generateTenantCSS(config: TenantConfig): string {
  const b = config.branding;
  return `
:root {
  --background: ${b.background};
  --foreground: ${b.foreground};
  --surface: ${b.surface};
  --primary: ${b.primaryColor};
  --secondary: ${b.secondaryColor};
  --accent: ${b.accentColor};
  --muted: ${b.muted};
  --color-surface: ${b.surface};
}`;
}
