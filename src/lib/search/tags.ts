import type { TSpell } from "../schema/spell";
import type { TFeature } from "../schema/feature";

export type TagKey =
  | "healing"
  | "damage"
  | "ritual"
  | "concentration"
  | "action"
  | "bonus-action"
  | "reaction"
  | "touch"
  | "self"
  | "short-rest"
  | "long-rest"
  | "buff"
  | "debuff"
  | "summon"
  | "utility";

// Maps every tag key to localized labels for quick lookup on the UI
export const TAG_CATALOG: Record<TagKey, { pt: string; en: string }> = {
  healing:        { pt: "Cura",             en: "Healing" },
  damage:         { pt: "Dano",             en: "Damage" },
  ritual:         { pt: "Ritual",           en: "Ritual" },
  concentration:  { pt: "Concentração",     en: "Concentration" },
  action:         { pt: "Ação",             en: "Action" },
  "bonus-action": { pt: "Ação Bônus",       en: "Bonus Action" },
  reaction:       { pt: "Reação",           en: "Reaction" },
  touch:          { pt: "Toque",            en: "Touch" },
  self:           { pt: "Pessoal",          en: "Self" },
  "short-rest":   { pt: "Descanso Curto",   en: "Short Rest" },
  "long-rest":    { pt: "Descanso Longo",   en: "Long Rest" },
  buff:           { pt: "Buff",             en: "Buff" },
  debuff:         { pt: "Debuff",           en: "Debuff" },
  summon:         { pt: "Invocação",        en: "Summon" },
  utility:        { pt: "Utilidade",        en: "Utility" },
};

// Stable ordering used to present tags consistently across lists
const ORDER: TagKey[] = [
  "healing","damage","ritual","concentration","action","bonus-action","reaction",
  "touch", "self", "short-rest","long-rest","buff","debuff","summon","utility"
];
export const TAG_ORDER = ORDER;

function norm(s: string) {
  // Remove accents and lowercase so Portuguese matches English heuristics
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
function has(txt: string | undefined, needles: string[]) {
  // quick guard against missing translations
  if (!txt) return false;
  const t = norm(txt);
  // check against several correlated keywords to capture different spellings
  return needles.some((n) => t.includes(norm(n)));
}

const JSON_TO_CANON: Record<string, TagKey> = {
  // core
  "cura": "healing", "healing": "healing",
  "dano": "damage", "dano em area": "damage", "damage": "damage",
  "ritual": "ritual",
  "concentracao": "concentration", "concentration": "concentration",
  "acao": "action", "action": "action",
  "acao bonus": "bonus-action", "bonus action": "bonus-action",
  "reacao": "reaction", "reaction": "reaction",
  "toque": "touch", "touch": "touch",
  "pessoal": "self", "self": "self",
  "descanso curto": "short-rest", "short rest": "short-rest",
  "descanso longo": "long-rest", "long rest": "long-rest",
  "buff": "buff", "debuff": "debuff",
  "invocacao": "summon", "summon": "summon",
  "utilidade": "utility", "utility": "utility",

  // most common tags
  "defesa": "buff",
  "controle": "debuff",
  "furtividade": "utility",
  "mobilidade": "utility",
  "teleporte": "utility",
  "suporte": "buff",
  "forca": "damage",
  "fogo": "damage",
  "acerto automatico": "damage",
  "ofensiva": "damage",
  "passiva": "utility",
  "recurso": "utility",
  "recarga": "utility",
  "magia": "utility",
  "transformacao": "utility",
  "clerigo": "utility",
  "explosao-de-recursos": "buff",
};

function mapJsonTags(tags?: string[]): TagKey[] {
  if (!tags?.length) return [];
  const out = new Set<TagKey>();
  for (const raw of tags) {
    const k = norm(raw).replace(/\s+/g, " ").trim();
    const mapped = JSON_TO_CANON[k];
    if (mapped) out.add(mapped);
  }
  return [...out];
}

/** Detect tags associated to a spell record */
export function detectSpellTags(sp: TSpell): TagKey[] {
  const tags = new Set<TagKey>();

  // (1) JSON -> canon
  mapJsonTags((sp as any).tags).forEach((t) => tags.add(t));

  // (2) Structured + heuristics
  if (sp.ritual) tags.add("ritual");
  if (sp.concentration) tags.add("concentration");

  const ctPT = sp.castingTime?.pt ?? "";
  const ctEN = sp.castingTime?.en ?? "";
  const hasBonus = has(ctPT, ["ação bônus"]) || has(ctEN, ["bonus action"]);
  const hasReact = has(ctPT, ["reação"]) || has(ctEN, ["reaction"]);
  const hasAct   = has(ctPT, ["ação"]) || has(ctEN, ["action"]);
  if (hasReact) tags.add("reaction");
  if (hasBonus) tags.add("bonus-action");
  else if (hasAct && !hasReact) tags.add("action"); // evita marcar "Ação" junto de "Bônus" ou "Reação"

  const rangePT = sp.range?.pt ?? "";
  const rangeEN = sp.range?.en ?? "";
  if (has(rangePT, ["toque"]) || has(rangeEN, ["touch"])) tags.add("touch");
  if (has(rangePT, ["pessoal"]) || has(rangeEN, ["self"])) tags.add("self");

  const bodyPT = sp.text?.pt ?? "";
  const bodyEN = sp.text?.en ?? "";
  if (has(bodyPT, ["curar","cura","pontos de vida"]) || has(bodyEN, ["heal","healing","hit points"])) tags.add("healing");
  if (has(bodyPT, ["dano"]) || has(bodyEN, ["damage"])) tags.add("damage");
  if (has(bodyPT, ["invocar","conjurar criatura"]) || has(bodyEN, ["summon","conjure"])) tags.add("summon");

  if (has(bodyPT, ["vantagem","aumenta","bônus"]) || has(bodyEN, ["advantage","increase","bonus"])) tags.add("buff");
  if (has(bodyPT, ["desvantagem","reduz","penalidade"]) || has(bodyEN, ["disadvantage","reduce","penalty"])) tags.add("debuff");

  if (has(bodyPT, ["descanso curto"]) || has(bodyEN, ["short rest"])) tags.add("short-rest");
  if (has(bodyPT, ["descanso longo"]) || has(bodyEN, ["long rest"])) tags.add("long-rest");

  if (!tags.has("healing") && !tags.has("damage")) {
    if (has(bodyPT, ["detectar","abrir","trancar","invisibilidade","teleportar","mensagem"]) ||
        has(bodyEN, ["detect","open","lock","invisibility","teleport","message"])) {
      tags.add("utility");
    }
  }

  return ORDER.filter((k) => tags.has(k));
}

/** Detect tags associated to a class feature record */
export function detectFeatureTags(ft: TFeature): TagKey[] {
  const tags = new Set<TagKey>();

  // (1) JSON -> canon
  mapJsonTags((ft as any).tags).forEach((t) => tags.add(t));

  // (2) Action/time
  const actPT = ft.action?.pt ?? "";
  const actEN = ft.action?.en ?? "";
  const hasBonus = has(actPT, ["ação bônus"]) || has(actEN, ["bonus action"]);
  const hasReact = has(actPT, ["reação"]) || has(actEN, ["reaction"]);
  const hasAct   = has(actPT, ["ação"]) || has(actEN, ["action"]);
  if (hasReact) tags.add("reaction");
  if (hasBonus) tags.add("bonus-action");
  else if (hasAct && !hasReact) tags.add("action"); // evita duplicidade

  const bodyPT = ft.text?.pt ?? "";
  const bodyEN = ft.text?.en ?? "";
  if (has(bodyPT, ["curar","cura","pontos de vida"]) || has(bodyEN, ["heal","healing","hit points"])) tags.add("healing");
  if (has(bodyPT, ["dano"]) || has(bodyEN, ["damage"])) tags.add("damage");
  if (has(bodyPT, ["vantagem","bônus"]) || has(bodyEN, ["advantage","bonus"])) tags.add("buff");
  if (has(bodyPT, ["desvantagem","reduz"]) || has(bodyEN, ["disadvantage","reduce"])) tags.add("debuff");
  if (has(bodyPT, ["descanso curto"]) || has(bodyEN, ["short rest"])) tags.add("short-rest");
  if (has(bodyPT, ["descanso longo"]) || has(bodyEN, ["long rest"])) tags.add("long-rest");
  if (has(bodyPT, ["invocar","conjurar criatura"]) || has(bodyEN, ["summon","conjure"])) tags.add("summon");

  if (!tags.has("healing") && !tags.has("damage")) {
    if (has(bodyPT, ["detectar","proteger","camuflar"]) || has(bodyEN, ["detect","protect","conceal"])) {
      tags.add("utility");
    }
  }

  return ORDER.filter((k) => tags.has(k));
}
