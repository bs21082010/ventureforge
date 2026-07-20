"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import AuthProvider from "@/components/auth-provider";
import { TenantProvider } from "@/components/tenant-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TenantProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[var(--background,#000000)]">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="lg:ml-20">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </AuthProvider>
    </TenantProvider>
  );
}
