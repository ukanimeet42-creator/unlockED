"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
}) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("unlocked-theme") as Theme) || defaultTheme;
    setThemeState(saved);
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [defaultTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("unlocked-theme", newTheme);
    } catch {
      // ignore
    }
    if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
