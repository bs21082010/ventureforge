"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-black/40 backdrop-blur-xl border border-white/10 text-gray-200 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]": variant === "default",
            "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]": variant === "primary",
            "bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]": variant === "secondary",
            "hover:bg-white/5 text-gray-300": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]": variant === "danger",
            "border border-white/10 bg-black/40 backdrop-blur-xl text-gray-300 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]": variant === "outline",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
