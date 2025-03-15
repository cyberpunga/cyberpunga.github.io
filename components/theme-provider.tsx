"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// @ts-expect-error
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
