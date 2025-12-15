"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Theme, darkTheme, lightTheme, ThemeName } from "./colors";

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("dark");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeName | null;
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setThemeName(savedTheme);
    }
    setMounted(true);
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", themeName);
    }
  }, [themeName, mounted]);

  const theme = themeName === "light" ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

