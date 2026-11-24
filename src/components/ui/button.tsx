import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.4)] active:scale-[0.98]",
        gradient:
          "bg-gradient-to-r from-[#A078FF] to-[#8B5CF6] text-white font-semibold shadow-lg shadow-[#8B5CF6]/20 hover:shadow-[#8B5CF6]/35 hover:brightness-105 active:scale-[0.98]",
        secondary:
          "bg-slate-100 dark:bg-[#1C1C2B] text-slate-800 dark:text-[#F5F3FF] border border-slate-200 dark:border-[#232336] hover:bg-slate-200 dark:hover:bg-[#25253A] hover:border-[#8B5CF6] active:scale-[0.98]",
        outline:
          "border border-slate-300 dark:border-[#232336] bg-transparent text-slate-700 dark:text-[#E4E1EC] hover:bg-slate-100 dark:hover:bg-[#151520] hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-[#363654]",
        ghost:
          "text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#151520] hover:text-slate-900 dark:hover:text-[#F5F3FF]",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm",
        success:
          "bg-[#22C55E] text-white hover:bg-[#16A34A] shadow-sm shadow-[#22C55E]/20",
        amber:
          "bg-[#F59E0B] text-slate-950 font-semibold hover:bg-[#D97706] shadow-sm",
        link:
          "text-[#8B5CF6] underline-offset-4 hover:underline p-0 h-auto",
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
