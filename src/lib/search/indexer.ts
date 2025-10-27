import MiniSearch from "minisearch";
import type { TSpell } from "../schema/spell";
import type { TFeature } from "../schema/feature";

/** unified index document (spells + features) */
export type UnifiedDoc = {
    uid: string;
    id: string;
    kind: "spell" | "feature";
    level: number;
    classes: string[];
    tags: string[];
    name_pt: string;
    name_en: string;
    text_pt: string;
    text_en: string;
}

/** normalizes text for searches to be lowercase and no accents */
function norm(s: string): string {
    try {
        return s
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    } catch {
        return s.toLowerCase()
    }
}

/** 
 * converts array of spells and features to index doc
 * the second param is optional for syntactic compability
 * e.g., toDocs(spells)
 */
export function toDocs(spells: TSpell[], features: TFeature[] = []): UnifiedDoc[] {
    const s: UnifiedDoc[] = spells.map((sp) => ({
        uid: `spell:${sp.id}`,
        id: sp.id,
        kind: "spell",
        level: sp.level,
        classes: sp.classes,
        tags: [
            sp.school?.pt ?? "",
            sp.school?.en ?? "",
            sp.ritual ? "ritual" : "",
            sp.concentration ? "concentracao" : "",
            `nivel ${sp.level}`,
            `level ${sp.level}`,
            ...sp.classes,
        ].filter(Boolean),
        name_pt: sp.name.pt,
        name_en: sp.name.en,
        text_pt: sp.text.pt,
        text_en: sp.text.en,
    }));

    const f: UnifiedDoc[] = features.map((ft) => ({
        uid: `feature:${ft.id}`,
        id: ft.id,
        kind: "feature",
        level: ft.level,
        classes: [ft.class],
        tags: [
            ft.class,
            `nivel ${ft.level}`,
            `level ${ft.level}`,
            ft.action?.pt ?? "",
            ft.action?.en ?? "",
            ft.uses ? `usos ${ft.uses}` : "",
            ft.uses ? `uses ${ft.uses}` : "",
        ].filter(Boolean),
        name_pt: ft.name.pt,
        name_en: ft.name.en,
        text_pt: ft.text.pt,
        text_en: ft.text.en,
    }));

    return [...s, ...f];
}

/** build MiniSearch with `id` and `kind` store for post filtering */
export function buildIndex(docs: UnifiedDoc[]) {
    const mini = new MiniSearch<UnifiedDoc>({
        idField: "uid",
        fields: ["name_pt", "name_en", "text_pt", "text_en", "classes", "tags"],
        storeFields: ["uid", "id", "kind"],
        processTerm: (t) => norm(t),
    });
    mini.addAll(docs);
    return mini;
}