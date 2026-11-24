import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full rounded-lg border border-slate-300 dark:border-[#232336] bg-white dark:bg-[#101018] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F5F3FF] shadow-sm transition-colors placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus-visible:outline-none focus-visible:border-[#8B5CF6] focus-visible:ring-2 focus-visible:ring-[#8B5CF6]/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
