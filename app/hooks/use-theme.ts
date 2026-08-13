"use client";

import { useCallback, useState } from "react";

export type Theme = "light" | "dark";

function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  try {
    return document.documentElement.classList.contains("dark");
  } catch {
    return false;
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(isDarkTheme() ? "dark" : "light");

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        window.localStorage.setItem("theme", next);
      } catch {
        // Ignore storage failures (e.g. private browsing).
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}