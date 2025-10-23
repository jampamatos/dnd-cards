import { create } from "zustand";
import { persist } from "zustand/middleware";

type Lang = "pt" | "en"
type Theme = "system" | "light" | "dark";

type Prefs = {
    lang: Lang; setLang: (v: Lang)=> void;
    theme: Theme; setTheme: (v: Theme)=> void;
};

export const usePrefs = create<Prefs>()(persist(
    (set) => ({
        lang: "pt",
        setLang: (v)=>set({ lang: v }),
        theme: "system",
        setTheme: (v)=>set({ theme: v }),
    }),
    { name: "dnd-cards-prefs" }
));