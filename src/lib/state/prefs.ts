import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { applyTheme, type Theme } from "../../styles/theme";

type Lang = "pt" | "en";

type PrefsCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const Ctx = createContext<PrefsCtx | null>(null);

const LS_LANG_KEY = "prefs.lang";
const LS_THEME_KEY = "prefs.theme";

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(LS_LANG_KEY) as Lang | null;
    if (saved === "pt" || saved === "en") return saved;
  } catch {
    /* noop: default to navigator language when storage is unavailable */
  }
  const nav = (navigator?.language || "pt").toLowerCase();
  return nav.startsWith("pt") ? "pt" : "en";
}

function detectInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(LS_THEME_KEY) as Theme | null;
    if (saved === "system" || saved === "light" || saved === "dark") return saved;
  } catch {
    /* noop: default to system when storage is unavailable */
  }
  return "system";
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);
  const [theme, setThemeState] = useState<Theme>(detectInitialTheme);

  // persist & reflect lang in <html lang="">
  useEffect(() => {
    try {
      localStorage.setItem(LS_LANG_KEY, lang);
    } catch {
      /* noop: ignore storage write failures (privacy mode, quota) */
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
    }
  }, [lang]);

  // apply & persist theme (including on first load)
  useEffect(() => {
    try {
      localStorage.setItem(LS_THEME_KEY, theme);
    } catch {
      /* noop: ignore storage write failures (privacy mode, quota) */
    }
    applyTheme(theme);
  }, [theme]);

  // react to system changes when theme === "system"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if (theme === "system") applyTheme("system"); };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme]);

  const value = useMemo<PrefsCtx>(() => ({
    lang,
    setLang: (l) => setLangState(l),
    theme,
    setTheme: (t) => setThemeState(t),
  }), [lang, theme]);

  return createElement(Ctx.Provider, { value }, children);
}

export function usePrefs(): PrefsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrefs must be used inside <PrefsProvider>");
  return ctx;
}
