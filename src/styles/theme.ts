export type Theme = "system" | "light" | "dark";
export function applyTheme(theme:Theme) {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (theme === "system" && prefersDark);
    root.dataset.theme = isDark ? "dark" : "light";
}