import type { TSpell } from "./schema/spell"
import type { TFeature } from "./schema/feature"
import { formatFeatureLevel, formatSpellLevel, type Lang } from "./format"

export type PillKind = "default" | "level" | "casting" | "duration" | "range"

export type PillValue =
  | string
  | {
      label: string
      kind?: PillKind
    }

const labelFor = (lang: Lang, pt: string, en: string) => (lang === "pt" ? pt : en)

export function buildSpellPills(spell: TSpell, lang: Lang): PillValue[] {
  const pills: PillValue[] = [
    { label: formatSpellLevel(spell.level, lang), kind: "level" },
    { label: labelFor(lang, spell.castingTime.pt, spell.castingTime.en), kind: "casting" },
    { label: labelFor(lang, spell.range.pt, spell.range.en), kind: "range" },
    { label: labelFor(lang, spell.duration.pt, spell.duration.en), kind: "duration" },
  ]

  if (spell.ritual) pills.push({ label: "Ritual" })
  if (spell.concentration) pills.push({ label: lang === "pt" ? "Concentração" : "Concentration" })

  return pills.filter((pill) => {
    const label = typeof pill === "string" ? pill : pill.label
    return Boolean(label && label.trim())
  })
}

export function buildFeaturePills(feature: TFeature, lang: Lang): PillValue[] {
  const pills: PillValue[] = [
    { label: formatFeatureLevel(feature.level, lang), kind: "level" },
  ]
  const action = labelFor(lang, feature.action?.pt ?? "", feature.action?.en ?? "")
  if (action) pills.push(action)
  if (feature.uses) pills.push(lang === "pt" ? `Usos: ${feature.uses}` : `Uses: ${feature.uses}`)
  return pills
}
