"use client";

import { createContext, useContext, useState, type ReactNode, useCallback } from "react";

// Define available languages
export type Language = "en" | "es" | "fr" | "de" | "ja";

// Create a context for localization
type LocalizationContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Import all translations
import { translations } from "@/localization/translations";

type TranslationKeys = Record<string, any> // Allow indexing with strings

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Translation function
  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let result: TranslationKeys = translations[language] as TranslationKeys;

      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = result[k];
        } else {
          // Fallback to English if translation is missing
          let fallback: TranslationKeys = translations["en"] as TranslationKeys;
          for (const fk of keys) {
            if (fallback && typeof fallback === "object" && fk in fallback) {
              fallback = fallback[fk];
            } else {
              return key; // Return the key if no translation found
            }
          }
          return typeof fallback === "string" ? fallback : key;
        }
      }

      return typeof result === "string" ? result : key;
    },
    [language]
  );

  return <LocalizationContext.Provider value={{ language, setLanguage, t }}>{children}</LocalizationContext.Provider>;
}

// Custom hook to use the localization context
export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
}
