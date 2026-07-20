"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { TenantConfig, DEFAULT_TENANT } from "@/types/tenant";
import { loadTenantConfig } from "@/lib/tenant/loader";

const TenantContext = createContext<TenantConfig>(DEFAULT_TENANT);

export function useTenant() {
  return useContext(TenantContext);
}

export function TenantProvider({ children, initialConfig }: { children: ReactNode; initialConfig?: TenantConfig }) {
  const [config, setConfig] = useState<TenantConfig>(initialConfig || DEFAULT_TENANT);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      applyTenantTheme(initialConfig);
      return;
    }

    loadTenantConfig().then((c) => {
      setConfig(c);
      applyTenantTheme(c);
    });
  }, [initialConfig]);

  return <TenantContext.Provider value={config}>{children}</TenantContext.Provider>;
}

function applyTenantTheme(config: TenantConfig) {
  const root = document.documentElement;
  const b = config.branding;

  root.style.setProperty("--background", b.background);
  root.style.setProperty("--foreground", b.foreground);
  root.style.setProperty("--surface", b.surface);
  root.style.setProperty("--primary", b.primaryColor);
  root.style.setProperty("--secondary", b.secondaryColor);
  root.style.setProperty("--accent", b.accentColor);
  root.style.setProperty("--muted", b.muted);
  root.style.setProperty("--color-surface", b.surface);

  document.title = `${b.name} - ${b.tagline}`;

  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", b.tagline);
}
