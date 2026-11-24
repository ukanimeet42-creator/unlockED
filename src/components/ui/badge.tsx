import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-purple-500/10 text-purple-700 dark:text-[#C4B5FD] border border-purple-500/20 dark:border-[rgba(139,92,246,0.3)]",
        emerald:
          "bg-emerald-500/10 text-emerald-700 dark:text-[#22C55E] border border-emerald-500/20 dark:border-[rgba(34,197,94,0.25)]",
        amber:
          "bg-amber-500/10 text-amber-700 dark:text-[#F59E0B] border border-amber-500/20 dark:border-[rgba(245,158,11,0.25)]",
        indigo:
          "bg-indigo-500/10 text-indigo-700 dark:text-[#A5B4FC] border border-indigo-500/20 dark:border-[rgba(99,102,241,0.3)]",
        error:
          "bg-rose-500/10 text-rose-700 dark:text-[#F87171] border border-rose-500/20 dark:border-[rgba(239,68,68,0.25)]",
        outline:
          "border border-slate-200 dark:border-[#232336] bg-slate-50 dark:bg-[#101018] text-slate-700 dark:text-[#94A3B8]",
        secondary:
          "bg-slate-100 dark:bg-[#1F1F26] text-slate-800 dark:text-[#E4E1EC] border border-slate-200 dark:border-[#2A2931]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variant === "emerald" && "bg-[#22C55E] animate-pulse",
            variant === "amber" && "bg-[#F59E0B]",
            variant === "error" && "bg-[#EF4444]",
            (!variant || variant === "default") && "bg-[#8B5CF6]"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
