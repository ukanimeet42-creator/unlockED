import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full rounded-lg border border-[#143326] bg-[#06110C] px-3.5 py-2.5 text-sm text-[#F0FDF4] shadow-sm transition-colors placeholder:text-[#5D7A6E] focus-visible:outline-none focus-visible:border-[#10B981] focus-visible:ring-2 focus-visible:ring-[#10B981]/20 disabled:cursor-not-allowed disabled:opacity-50",
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
