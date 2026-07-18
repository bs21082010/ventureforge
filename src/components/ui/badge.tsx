"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
  className?: string;
}

function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium backdrop-blur-xl",
        {
          "bg-white/10 text-gray-300": variant === "default",
          "bg-green-500/10 text-green-300": variant === "success",
          "bg-yellow-500/10 text-yellow-300": variant === "warning",
          "bg-red-500/10 text-red-300": variant === "danger",
          "bg-blue-500/10 text-blue-300": variant === "info",
          "bg-purple-500/10 text-purple-300": variant === "purple",
        },
        {
          "px-2 py-0.5 text-xs": size === "sm",
          "px-2.5 py-1 text-sm": size === "md",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export { Badge };
