import type { TFeature } from "../schema/feature";
import type { TSpell } from "../schema/spell";

type MaybeTagged = { tags?: string[] };

export type TagKey =
  | "healing"
  | "damage"
  | "banishment"
  | "buff"
  | "debuff"
  | "communication"
  | "combat"
  | "control"
  | "creation"
  | "detection"
  | "environment"
  | "exploration"
  | "foreknowledge"
  | "shapechanging"
  | "social"
  | "summon"
  | "transformation"
  | "defense"
  | "offense"
  | "passive"
  | "stealth"
  | "mobility"
  | "magic"
  | "negation"
  | "resource"
  | "resource-burst"
  | "recharge"
  | "cleric"
  | "ritual"
  | "concentration"
  | "touch"
  | "self"
  | "short-rest"
  | "long-rest"
  | "scrying"
  | "summoning"
  | "teleportation"
  | "utility"
  | "warding";

// Maps every tag key to localized labels for quick lookup on the UI
export const TAG_CATALOG: Record<TagKey, { pt: string; en: string }> = {
  healing:        { pt: "Cura",                   en: "Healing" },
  damage:         { pt: "Dano",                   en: "Damage" },
  buff:           { pt: "Buff",                   en: "Buff" },
  banishment:     { pt: "Banimento",              en: "Banishment" },
  debuff:         { pt: "Debuff",                 en: "Debuff" },
  communication:  { pt: "Comunicação",            en: "Communication" },
  control:        { pt: "Controle",               en: "Control" },
  combat:         { pt: "Combate",                en: "Combat" },
  creation:       { pt: "Criação",                en: "Creation" },
  detection:      { pt: "Detecção",               en: "Detection" },
  environment:    { pt: "Ambiente",               en: "Environment" },
  exploration:    { pt: "Exploração",             en: "Exploration" },
  foreknowledge:  { pt: "Presciência",            en: "Foreknowledge" },
  shapechanging:  { pt: "Metamorfose",            en: "Shapechanging" },
  social:         { pt: "Social",                 en: "Social" },
  summon:         { pt: "Invocação",              en: "Summon" },
  transformation: { pt: "Transformação",          en: "Transformation" },
  defense:        { pt: "Defesa",                 en: "Defense" },
  offense:        { pt: "Ofensiva",               en: "Offense" },
  passive:        { pt: "Passiva",                en: "Passive" },
  stealth:        { pt: "Furtividade",            en: "Stealth" },
  mobility:       { pt: "Mobilidade",             en: "Mobility" },
  magic:          { pt: "Magia",                  en: "Magic" },
  negation:       { pt: "Negação",                en: "Negation"},
  resource:       { pt: "Recurso",                en: "Resource" },
  "resource-burst": { pt: "Explosão de Recursos", en: "Resource Burst" },
  recharge:       { pt: "Recarga",                en: "Recharge" },
  cleric:         { pt: "Clérigo",                en: "Cleric" },
  ritual:         { pt: "Ritual",                 en: "Ritual" },
  concentration:  { pt: "Concentração",           en: "Concentration" },
  touch:          { pt: "Toque",                  en: "Touch" },
  self:           { pt: "Pessoal",                en: "Self" },
  "short-rest":   { pt: "Descanso Curto",         en: "Short Rest" },
  "long-rest":    { pt: "Descanso Longo",         en: "Long Rest" },
  scrying:        { pt: "Vidência",               en: "Scrying" },
  summoning:      { pt: "Invocação",              en: "Summoning" },
  utility:        { pt: "Utilidade",              en: "Utility" },
  teleportation:  { pt: "Teletransporte",         en: "Teleportation" },
  warding:        { pt: "Proteção",               en: "Warding"},
};

// Stable ordering used to present tags consistently across lists
const ORDER: TagKey[] = [
  "healing",
  "damage",
  "banishment",
  "buff",
  "debuff",
  "combat",
  "communication",
  "control",
  "creation",
  "detection",
  "environment",
  "exploration",
  "foreknowledge",
  "shapechanging",
  "social",
  "summon",
  "transformation",
  "defense",
  "offense",
  "passive",
  "stealth",
  "mobility",
  "magic",
  "negation",
  "resource",
  "resource-burst",
  "recharge",
  "cleric",
  "ritual",
  "concentration",
  "touch",
  "self",
  "short-rest",
  "long-rest",
  "scrying",
  "summoning",
  "teleportation",
  "utility",
  "warding"
];
export const TAG_ORDER = ORDER;

// ------------------------------
// Utilities
// ------------------------------

function norm(s: string) {
  // Remove accents and lowercase so Portuguese variants match canonical keys
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// ------------------------------
// JSON -> Canonical mapping
// ------------------------------

const JSON_TO_CANON: Record<string, TagKey> = {
  cura: "healing",
  healing: "healing",
  dano: "damage",
  damage: "damage",
  buff: "buff",
  debuff: "debuff",
  banimento: "banishment",
  banishment: "banishment",
  combate: "combat",
  combat: "combat",
  comunicacao: "communication",
  communication: "communication",
  controle: "control",
  control: "control",
  criacao: "creation",
  creation: "creation",
  deteccao: "detection",
  detection: "detection",
  ambiente: "environment",
  environment: "environment",
  exploracao: "exploration",
  exploration: "exploration",
  presciencia: "foreknowledge",
  foreknowledge: "foreknowledge",
  metamorfose: "shapechanging",
  shapechanging: "shapechanging",
  social: "social",
  ritual: "ritual",
  concentracao: "concentration",
  concentration: "concentration",
  toque: "touch",
  touch: "touch",
  pessoal: "self",
  self: "self",
  "descanso curto": "short-rest",
  "short rest": "short-rest",
  "descanso longo": "long-rest",
  "long rest": "long-rest",
  videncia: "scrying",
  scrying: "scrying",
  invocacao: "summoning",
  summoning: "summoning",
  defesa: "defense",
  defense: "defense",
  ofensiva: "offense",
  offense: "offense",
  passiva: "passive",
  passive: "passive",
  furtividade: "stealth",
  stealth: "stealth",
  mobilidade: "mobility",
  mobility: "mobility",
  magia: "magic",
  magic: "magic",
  negacao: "negation",
  negation: "negation",
  recurso: "resource",
  resource: "resource",
  "explosao-de-recursos": "resource-burst",
  "explosao de recursos": "resource-burst",
  "resource burst": "resource-burst",
  recarga: "recharge",
  recharge: "recharge",
  clerigo: "cleric",
  cleric: "cleric",
  transformacao: "transformation",
  transformation: "transformation",
  utilidade: "utility",
  utility: "utility",
  teletransporte: "teleportation",
  teleportation: "teleportation",
  protecao: "warding",
  warding: "warding"
};

function mapJsonTags(tags?: string[]): TagKey[] {
  if (!tags?.length) return [];
  const found = new Set<TagKey>();
  for (const rawTag of tags) {
    if (typeof rawTag !== "string") continue;
    const key = norm(rawTag).replace(/\s+/g, " ").trim();
    const canonical = JSON_TO_CANON[key];
    if (canonical) found.add(canonical);
  }
  if (found.size === 0) return [];
  return ORDER.filter((k) => found.has(k));
}

// ------------------------------
// Public API
// ------------------------------

export function detectSpellTags(sp: TSpell): TagKey[] {
  return mapJsonTags((sp as MaybeTagged).tags);
}

export function detectFeatureTags(ft: TFeature): TagKey[] {
  return mapJsonTags((ft as MaybeTagged).tags);
}

