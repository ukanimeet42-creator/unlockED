"use client";

import * as React from "react";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-[#232336] bg-slate-100 dark:bg-[#151520] flex items-center justify-center opacity-60 ${className || ""}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative w-9 h-9 rounded-xl border border-slate-200 dark:border-[#232336] bg-slate-100 dark:bg-[#151520] hover:bg-slate-200 dark:hover:bg-[#1F1F26] hover:border-slate-300 dark:hover:border-[#363654] flex items-center justify-center transition-all duration-200 text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 cursor-pointer ${className || ""}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-[#C4B5FD] transition-transform hover:scale-110" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500 transition-transform hover:scale-110" />
      )}
    </button>
  );
}
