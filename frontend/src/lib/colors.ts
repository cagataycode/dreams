export interface Theme {
  background: string;
  text: string;
  card: string;
  border: string;
}

export const darkTheme: Theme = {
  background: "oklch(14.5% 0 0)",
  text: "oklch(98.5% 0 0)",
  card: "oklch(20.5% 0 0)",
  border: "oklch(1 0 0 / 0.1)",
};

export const lightTheme: Theme = {
  background: "oklch(98.5% 0 0)",
  text: "oklch(14.5% 0 0)",
  card: "oklch(93% 0 0)",
  border: "oklch(0 0 0 / 0.1)",
};

export type ThemeName = "dark" | "light";
export type ColorKey = keyof Theme;

// Default to dark theme for backwards compatibility
export const colors = darkTheme;

// Helper to get theme by name
export const getTheme = (themeName: ThemeName): Theme => {
  return themeName === "light" ? lightTheme : darkTheme;
};
