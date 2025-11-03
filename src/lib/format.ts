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

const CLASS_LABELS: Record<string, { pt: string; en: string }> = {
  Artificer: { pt: "Artífice", en: "Artificer" },
  Bard: { pt: "Bardo", en: "Bard" },
  Cleric: { pt: "Clérigo", en: "Cleric" },
  Druid: { pt: "Druida", en: "Druid" },
  Fighter: { pt: "Guerreiro", en: "Fighter" },
  Paladin: { pt: "Paladino", en: "Paladin" },
  Ranger: { pt: "Patrulheiro", en: "Ranger" },
  Rogue: { pt: "Ladino", en: "Rogue" },
  Sorcerer: { pt: "Feiticeiro", en: "Sorcerer" },
  Warlock: { pt: "Bruxo", en: "Warlock" },
  Wizard: { pt: "Mago", en: "Wizard" },
}

export function formatClassName(clazz: string, lang: Lang): string {
  const labels = CLASS_LABELS[clazz]
  if (labels) return lang === "pt" ? labels.pt : labels.en
  return clazz
}

const SCHOOL_LABELS: Record<string, { pt: string; en: string }> = {
  Abjuration: { pt: "Abjuração", en: "Abjuration" },
  Conjuration: { pt: "Conjuração", en: "Conjuration" },
  Divination: { pt: "Adivinhação", en: "Divination" },
  Enchantment: { pt: "Encantamento", en: "Enchantment" },
  Evocation: { pt: "Evocação", en: "Evocation" },
  Illusion: { pt: "Ilusão", en: "Illusion" },
  Necromancy: { pt: "Necromancia", en: "Necromancy" },
  Transmutation: { pt: "Transmutação", en: "Transmutation" },
}

export function formatSchoolName(school: string, lang: Lang): string {
  const labels = SCHOOL_LABELS[school]
  if (labels) return lang === "pt" ? labels.pt : labels.en
  return school
}
