import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#10B981] text-slate-950 font-bold hover:bg-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]",
        gradient:
          "bg-gradient-to-r from-[#00DC82] to-[#10B981] text-slate-950 font-bold shadow-lg shadow-[#10B981]/25 hover:shadow-[#10B981]/40 hover:brightness-105 active:scale-[0.98]",
        secondary:
          "bg-[#0A1913] text-[#ECFDF5] border border-[#16382C] hover:bg-[#0E241B] hover:border-[#10B981] active:scale-[0.98]",
        outline:
          "border border-[#16382C] bg-transparent text-[#D1FAE5] hover:bg-[#0A1913] hover:text-white hover:border-[#10B981]",
        ghost:
          "text-[#8FA69B] hover:bg-[#0A1913] hover:text-[#ECFDF5]",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm",
        success:
          "bg-[#10B981] text-slate-950 font-bold hover:bg-[#059669] shadow-sm shadow-[#10B981]/20",
        amber:
          "bg-[#F59E0B] text-slate-950 font-semibold hover:bg-[#D97706] shadow-sm",
        link:
          "text-[#10B981] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
