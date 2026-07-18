"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function Progress({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorMap = {
    default: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  const heightMap = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-white/10", heightMap[size])}>
        <div
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            colorMap[variant],
            heightMap[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export { Progress };
