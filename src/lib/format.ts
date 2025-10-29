export type Lang = "pt" | "en"

export function formatSpellLevel(level: number, lang: Lang): string {
  if (lang === "pt") {
    if (level === 0) return "Truque"
    return `${level}º Círculo`
  }
  if (level === 0) return "Cantrip"
  return `Level ${level}`
}

export function formatFeatureLevel(level: number, lang: Lang): string {
  return lang === "pt" ? `Nível ${level}` : `Level ${level}`
}
