"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
  animated?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", animated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl p-6 transition-all duration-200",
        {
          "bg-black/40 backdrop-blur-xl border border-white/10 shadow-sm hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]": variant === "default" && !animated,
          "bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]": variant === "elevated" && !animated,
          "bg-black/40 backdrop-blur-xl border border-white/10": variant === "bordered" && !animated,
          "animate-border-gradient bg-black/40 backdrop-blur-xl shadow-sm hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]": animated,
        },
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-4 flex flex-col space-y-1.5", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight text-gray-100", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-400", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
