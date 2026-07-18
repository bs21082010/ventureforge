"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = (session?.user as any)?.role || "USER";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-black/60 px-6 backdrop-blur-xl">
      <div>
        <p className="text-xs text-gray-400">Welcome back</p>
        <p className="text-sm font-medium text-gray-100">
          {session ? userName : "Your Business Command Center"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-gray-200">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        {session ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900/50 text-sm font-medium text-blue-300">
              {userInitial}
            </div>
            <div className="hidden text-right md:block">
              <p className="text-xs font-medium text-gray-200">{userName}</p>
              <p className="text-[10px] text-gray-400">{userRole}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => window.location.href = "/auth/signin"}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
