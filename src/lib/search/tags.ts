import type { TSpell } from "../schema/spell";
import type { TFeature } from "../schema/feature";

type MaybeTagged = { tags?: string[] };

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
  | "utility"
  | "shapechanging";

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
  shapechanging:  { pt: "Metamorfose",      en: "Shapechanging",}
};

// Stable ordering used to present tags consistently across lists
const ORDER: TagKey[] = [
  "healing","damage","ritual","concentration","action","bonus-action","reaction",
  "touch","self","short-rest","long-rest","buff","debuff","summon","utility", "shapechanging"
];
export const TAG_ORDER = ORDER;

// ------------------------------
// Utilities
// ------------------------------

function norm(s: string) {
  // Remove accents and lowercase so Portuguese matches English heuristics
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function has(txt: string | undefined, needles: string[]) {
  // Quick guard against missing translations
  if (!txt) return false;
  const t = norm(txt);
  // Check against several correlated keywords to capture different spellings
  return needles.some((n) => t.includes(norm(n)));
}

function textHaystack(pt?: string, en?: string): string {
  // Lowercased PT+EN blob for regex checks
  const a = (pt ?? "").toLowerCase();
  const b = (en ?? "").toLowerCase();
  return `${a}\n${b}`;
}

// ------------------------------
// JSON -> Canonical mapping
// ------------------------------

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
  "metamorfose": "shapechanging", "appearance": "shapechanging",

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

// ------------------------------
// Robust BUFF detection (textual)
// ------------------------------

/**
 * Positive textual indicators that truly imply a buff (benefit to the target).
 * We deliberately avoid generic "increase/aumenta" unless tied to concrete buffs.
 */
const RX_BUFF_POSITIVE: RegExp[] = [
  // Portuguese
  /\b(bônus|bonus)\b/i,
  /\b(vantagem)\b/i,
  /\b(pontos?\s+de\s+vida(?:\s+temporários?)?)\b/i,
  /\b(pontos?\s+de\s+vida\s+máximos?)\s+(?:aumentam|aumenta)\b/i,
  /\b(ca|classe\s+de\s+armadura)\s*(\+|\bmais\b)\s*\d+\b/i,
  /\b(ataque|ataques|testes?|salvaguardas?)\s*(\+|\bmais\b)\s*\d+\b/i,
  // English
  /\bbonus\b/i,
  /\badvantage\b/i,
  /\btemporary\s+hit\s+points?\b/i,
  /\bmaximum\s+hit\s+points?\s+(?:increase|increases)\b/i,
  /\b(ac|armor\s+class)\s*(\+|\bplus\b)\s*\d+\b/i,
  /\b(attack|checks?|saving\s+throws?)\s*(\+|\bplus\b)\s*\d+\b/i,
];

/**
 * Negative contexts that must NOT imply buff.
 * Typical false positive: "damage increases ..." / "o dano aumenta ..."
 */
const RX_BUFF_NEGATIVE: RegExp[] = [
  // Portuguese
  /\b(o\s+)?dano\s+(aumenta|aumentam)\b/i,
  /\baumenta(?:r)?\s+o\s+dano\b/i,
  // English
  /\bdamage\s+(increase|increases|increased)\b/i,
  /\bincrease(?:s|d)?\s+(?:the\s+)?damage\b/i,
];

function detectBuffFromBody(pt?: string, en?: string): boolean {
  const hay = textHaystack(pt, en);
  const hasPositive = RX_BUFF_POSITIVE.some((rx) => rx.test(hay));
  const hasNegative = RX_BUFF_NEGATIVE.some((rx) => rx.test(hay));
  return hasPositive && !hasNegative;
}

// ------------------------------
// Public API
// ------------------------------

/** Detect tags associated to a spell record */
export function detectSpellTags(sp: TSpell): TagKey[] {
  const tags = new Set<TagKey>();

  // (1) JSON -> canonical (source of truth)
  mapJsonTags((sp as MaybeTagged).tags).forEach((t) => tags.add(t));

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
  else if (hasAct && !hasReact) tags.add("action"); // keep "Action" only when it's not Reaction/Bonus

  const rangePT = sp.range?.pt ?? "";
  const rangeEN = sp.range?.en ?? "";
  if (has(rangePT, ["toque"]) || has(rangeEN, ["touch"])) tags.add("touch");
  if (has(rangePT, ["pessoal"]) || has(rangeEN, ["self"])) tags.add("self");

  const bodyPT = sp.text?.pt ?? "";
  const bodyEN = sp.text?.en ?? "";
  if (has(bodyPT, ["curar","cura","pontos de vida"]) || has(bodyEN, ["heal","healing","hit points"])) tags.add("healing");
  if (has(bodyPT, ["dano"]) || has(bodyEN, ["damage"])) tags.add("damage");
  if (has(bodyPT, ["invocar","conjurar criatura"]) || has(bodyEN, ["summon","conjure"])) tags.add("summon");

  // --- refined BUFF detection (avoid "damage increases" false positives) ---
  if (detectBuffFromBody(bodyPT, bodyEN)) tags.add("buff");

  // Debuff can remain simple (common, explicit wording)
  if (has(bodyPT, ["desvantagem","reduz","penalidade"]) || has(bodyEN, ["disadvantage","reduce","penalty"])) tags.add("debuff");

  if (has(bodyPT, ["descanso curto"]) || has(bodyEN, ["short rest"])) tags.add("short-rest");
  if (has(bodyPT, ["descanso longo"]) || has(bodyEN, ["long rest"])) tags.add("long-rest");

  // Utility as a fallback when not healing/damage
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

  // (1) JSON -> canonical
  mapJsonTags((ft as MaybeTagged).tags).forEach((t) => tags.add(t));

  // (2) Action/time
  const actPT = ft.action?.pt ?? "";
  const actEN = ft.action?.en ?? "";
  const hasBonus = has(actPT, ["ação bônus"]) || has(actEN, ["bonus action"]);
  const hasReact = has(actPT, ["reação"]) || has(actEN, ["reaction"]);
  const hasAct   = has(actPT, ["ação"]) || has(actEN, ["action"]);
  if (hasReact) tags.add("reaction");
  if (hasBonus) tags.add("bonus-action");
  else if (hasAct && !hasReact) tags.add("action"); // avoid duplication

  const bodyPT = ft.text?.pt ?? "";
  const bodyEN = ft.text?.en ?? "";
  if (has(bodyPT, ["curar","cura","pontos de vida"]) || has(bodyEN, ["heal","healing","hit points"])) tags.add("healing");
  if (has(bodyPT, ["dano"]) || has(bodyEN, ["damage"])) tags.add("damage");

  // Reuse refined buff detector for features as well
  if (detectBuffFromBody(bodyPT, bodyEN)) tags.add("buff");

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
