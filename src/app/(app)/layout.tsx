"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import AuthProvider from "@/components/auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#000000]">
        <Sidebar />
        <div className="ml-20">
          <Header />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
