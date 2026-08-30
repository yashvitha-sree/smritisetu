import React, { createContext, useContext, useState, useEffect } from "react";
import { LANGUAGES, getTranslation } from "./translations";
import type { LangCode, TranslationKey } from "./translations";

interface LanguageContextType {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  t: (key: TranslationKey) => string;
  languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("cognicare_lang") as LangCode;
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setLangState(saved);
    }
  }, []);

  const setLanguage = (lang: LangCode) => {
    setLangState(lang);
    localStorage.setItem("cognicare_lang", lang);
  };

  const t = (key: TranslationKey) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
