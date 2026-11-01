import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const LANG_KEY = "bc_lang";
const LanguageContext = createContext(null);

const readStoredLang = () => {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === "mr" || saved === "en" ? saved : "en";
  } catch {
    return "en";
  }
};

// Looks up "a.b.c" in the dictionary and swaps {name} placeholders
const resolve = (dict, key) => dict[key];

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* storage can be blocked, ignore */
    }
  }, [lang]);

  const setLang = useCallback((next) => setLangState(next === "mr" ? "mr" : "en"), []);
  const toggleLang = useCallback(() => setLangState((l) => (l === "en" ? "mr" : "en")), []);

  const t = useCallback(
    (key, vars) => {
      let text = resolve(translations[lang], key) ?? resolve(translations.en, key) ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replaceAll(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
};
