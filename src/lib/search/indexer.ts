import MiniSearch from "minisearch";
import type { TSpell } from "../schema/spell";

export type SearchDoc = {
    id: string; kind: "spell";
    name_pt: string; name_en: string;
    body_pt: string; body_en: string;
    level: number; classes: string[];
};

function normalizeText(s: unknown): string {
    if (!s || typeof s !== "string") return "";
    // NFD + remove diacritics + lowercase + trim
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function toDocs(spells: TSpell[]): SearchDoc[] {
    return spells.map(s => ({
        id: s.id, 
        kind: "spell",
        name_pt: normalizeText(s.name.pt), 
        name_en: normalizeText(s.name.en),
        body_pt: normalizeText(s.text.pt), 
        body_en: normalizeText(s.text.en),
        level: s.level, 
        classes: (s.classes || []).map(c => normalizeText(c))
    }));
}

export function buildIndex(docs: SearchDoc[]) {
  const options: any = {
    fields: ["name_pt","name_en","body_pt","body_en","classes"],        // searchable
    storeFields: ["id","kind","name_pt","name_en","level","classes"],   // returned
    fieldOptions: {
        name_pt: { boost: 4 },
        name_en: { boost: 3 },
        body_pt: { boost: 2 },
        body_en: { boost: 2 },
        classes: { boost: 1 }
    },
    searchOptions: { prefix: true, fuzzy: 0.2 }
  };
  const ms = new MiniSearch<SearchDoc>(options);
  ms.addAll(docs);
  return ms;
}