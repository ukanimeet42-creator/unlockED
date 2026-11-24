import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30",
        emerald:
          "bg-[#10B981]/15 text-[#00DC82] border border-[#10B981]/30",
        amber:
          "bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30",
        indigo:
          "bg-[#059669]/20 text-[#6EE7B7] border border-[#059669]/30",
        error:
          "bg-rose-500/15 text-[#F87171] border border-rose-500/30",
        outline:
          "border border-[#143326] bg-[#0A1913] text-[#8FA69B]",
        secondary:
          "bg-[#0F271D] text-[#ECFDF5] border border-[#16382C]",
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
            variant === "emerald" && "bg-[#00DC82] animate-pulse",
            variant === "amber" && "bg-[#F59E0B]",
            variant === "error" && "bg-[#EF4444]",
            (!variant || variant === "default") && "bg-[#10B981]"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
