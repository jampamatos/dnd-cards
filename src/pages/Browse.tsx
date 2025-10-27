import { useEffect, useMemo, useState } from "react";
import type MiniSearch from "minisearch";
import Card from "../components/Card";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import { SpellsArray } from "../lib/schema/spell";
import { FeaturesArray } from "../lib/schema/feature";
import type { TSpell } from "../lib/schema/spell";
import type { TFeature } from "../lib/schema/feature";
import { buildIndex, toDocs } from "../lib/search/indexer";
import type { UnifiedDoc } from "../lib/search/indexer";
import { detectSpellTags, detectFeatureTags, type TagKey } from "../lib/search/tags";
import { usePrefs } from "../lib/state/prefs";

type HitKind = "spell" | "feature";
type SortOption = "name-asc" | "level-asc" | "level-desc";

type SearchHit = { id?: string; kind?: HitKind; uid?: string };
type PickedHit = { id: string; kind: HitKind };

const toPickedHit = (hit: SearchHit | null | undefined): PickedHit | null => {
  if (!hit) return null;
  const { kind } = hit;
  if (kind !== "spell" && kind !== "feature") return null;
  if (typeof hit.id === "string" && hit.id) return { kind, id: hit.id };
  if (typeof hit.uid === "string") {
    const sep = hit.uid.indexOf(":");
    if (sep >= 0 && sep < hit.uid.length - 1) return { kind, id: hit.uid.slice(sep + 1) };
  }
  return null;
};

const isPickedHit = (hit: PickedHit | null): hit is PickedHit => Boolean(hit);

const collectIdsByKind = (
  mini: MiniSearch<UnifiedDoc> | null,
  query: string,
  kind: HitKind
): string[] | null => {
  const trimmed = query.trim();
  if (!mini || !trimmed) return null;
  const hits = (mini.search(trimmed, { prefix: true }) as SearchHit[])
    .map(toPickedHit)
    .filter(isPickedHit)
    .filter((hit) => hit.kind === kind)
    .map((hit) => hit.id);
  return hits;
};

const filterByIds = <T,>(
  items: T[],
  ids: string[] | null,
  getId: (item: T) => string
): T[] => {
  if (!ids) return items;
  if (ids.length === 0) return [];
  const idSet = new Set(ids);
  return items.filter((item) => idSet.has(getId(item)));
};

const sortByOption = <T extends { level: number; name: { pt: string } }>(
  items: T[],
  sort: SortOption
): T[] => {
  const sorted = items.slice();
  if (sort === "name-asc") sorted.sort((x, y) => x.name.pt.localeCompare(y.name.pt));
  if (sort === "level-asc") sorted.sort((x, y) => (x.level - y.level) || x.name.pt.localeCompare(y.name.pt));
  if (sort === "level-desc") sorted.sort((x, y) => (y.level - x.level) || x.name.pt.localeCompare(y.name.pt));
  return sorted;
};

type Tab = "spells" | "features";

export default function Browse() {
  const [tab, setTab] = useState<Tab>("spells");

  // spells state
  const [spells, setSpells] = useState<TSpell[]>([]);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<number | "any">("any");
  const [clazz, setClazz] = useState<string | "any">("any");
  const [tags, setTags] = useState<TagKey[]>([]);
  const [sort, setSort] = useState<SortOption>("level-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // features state
  const [features, setFeatures] = useState<TFeature[]>([]);
  const [fLevel, setFLevel] = useState<number | "any">("any");
  const [fClazz, setFClazz] = useState<string | "any">("any");
  const [fTags, setFTags] = useState<TagKey[]>([]);
  const [fSort, setFSort] = useState<SortOption>("level-asc");
  const [fPage, setFPage] = useState(1);
  const [fPageSize, setFPageSize] = useState(12);

  const [error, setError] = useState<string | null>(null);

  // load data
  useEffect(() => {
    import("../data/srd/spells.json").then(m => setSpells(SpellsArray.parse(m.default))).catch(e=>setError(String(e)));
    import("../data/srd/features.json").then(m => setFeatures(FeaturesArray.parse(m.default))).catch(e=>setError(String(e)));
  }, []);

  // unified search index
  const mini = useMemo<MiniSearch<UnifiedDoc> | null>(() => {
    if (!spells.length && !features.length) return null;
    return buildIndex(toDocs(spells, features));
  }, [spells, features]);

  // tag maps (id -> TagKey[])
  const spellTagMap = useMemo(() => {
    const m = new Map<string, TagKey[]>();
    for (const sp of spells) m.set(sp.id, detectSpellTags(sp));
    return m;
  }, [spells]);

  const featureTagMap = useMemo(() => {
    const m = new Map<string, TagKey[]>();
    for (const ft of features) m.set(ft.id, detectFeatureTags(ft));
    return m;
  }, [features]);

  // helpers
  const hasAllTags = (keys: TagKey[] | undefined, selected: TagKey[]) =>
    selected.length === 0 || (keys && selected.every((k) => keys.includes(k)));

  const toggleSpellTag = (k: TagKey) => {
    setTags((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleFeatureTag = (k: TagKey) => {
    setFTags((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // spells pipeline
  const spellsFiltered = useMemo(() => {
    const ids = collectIdsByKind(mini, q, "spell");
    let arr = filterByIds(spells.slice(), ids, (s) => s.id);
    if (level !== "any") arr = arr.filter((s) => s.level === level);
    if (clazz !== "any") arr = arr.filter((s) => s.classes.includes(clazz));
    if (tags.length > 0) {
      arr = arr.filter((s) => hasAllTags(spellTagMap.get(s.id), tags));
    }
    return arr;
  }, [mini, spells, q, level, clazz, tags, spellTagMap]);

  const spellsSorted = useMemo(() => sortByOption(spellsFiltered, sort), [spellsFiltered, sort]);
  const sStart = (page-1) * pageSize;
  const sItems = spellsSorted.slice(sStart, sStart + pageSize);
  useEffect(()=>{ setPage(1); }, [q, level, clazz, tags, pageSize, sort]);

  function handleLevelClick(l:number){ setLevel(l); window.scrollTo({top:0, behavior:"smooth"}); }
  function handleClassClick(c:string){ setClazz(c); window.scrollTo({top:0, behavior:"smooth"}); }
  function clearAllSpells(){ setQ(""); setLevel("any"); setClazz("any"); setTags([]); setSort("level-asc"); }

  // features pipeline
  const featuresFiltered = useMemo(() => {
    const ids = collectIdsByKind(mini, q, "feature");
    let arr = filterByIds(features.slice(), ids, (f) => f.id);
    if (fLevel !== "any") arr = arr.filter((f) => f.level === fLevel);
    if (fClazz !== "any") arr = arr.filter((f) => f.class === fClazz);
    if (fTags.length > 0) {
      arr = arr.filter((f) => hasAllTags(featureTagMap.get(f.id), fTags));
    }
    return arr;
  }, [mini, features, q, fLevel, fClazz, fTags, featureTagMap]);

  const featuresSorted = useMemo(() => sortByOption(featuresFiltered, fSort), [featuresFiltered, fSort]);
  const fStart = (fPage-1) * fPageSize;
  const fItems = featuresSorted.slice(fStart, fStart + fPageSize);
  useEffect(()=>{ setFPage(1); }, [q, fLevel, fClazz, fTags, fPageSize, fSort]);

  if (error) return <p style={{ color:"crimson" }}>Erro carregando dados: {error}</p>;

  const { lang } = usePrefs();
  const L = lang === "pt"
      ? { title: "Navegar", spells: "Magias", features: "Características" }
      : { title: "Browse",   spells: "Spells", features: "Features" };

  return (
    <div>
      <h2>{L.title}</h2>

      <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setTab("spells")}
                style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 8, background: tab === "spells" ? "#eef5ff" : "#fff" }}>
          {L.spells}
        </button>
        <button onClick={() => setTab("features")}
                style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 8, background: tab === "features" ? "#eef5ff" : "#fff" }}>
          {L.features}
        </button>
      </div>

      {tab === "spells" ? (
        <>
          <Filters
            q={q} setQ={setQ}
            level={level} setLevel={setLevel}
            clazz={clazz} setClazz={setClazz}
            sort={sort} setSort={setSort}
            total={spellsSorted.length}
            pageSize={pageSize} setPageSize={setPageSize}
            onClearAll={clearAllSpells}
            onClearLevel={()=>setLevel("any")}
            onClearClazz={()=>setClazz("any")}
            // tags
            tags={tags} setTags={setTags} onClearTags={()=>setTags([])}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {sItems.map((sp) => {
              const keys = spellTagMap.get(sp.id) ?? [];
              return (
                <Card
                  key={sp.id}
                  id={sp.id}
                  kind="spell"
                  titlePt={sp.name.pt}
                  titleEn={sp.name.en}
                  schoolPt={sp.school.pt}
                  schoolEn={sp.school.en}
                  pillsPt={[
                    `Nível ${sp.level}`,
                    sp.castingTime.pt, sp.range.pt, sp.duration.pt,
                    sp.ritual ? "Ritual" : "", sp.concentration ? "Concentração" : "",
                  ].filter(Boolean)}
                  pillsEn={[
                    `Level ${sp.level}`,
                    sp.castingTime.en, sp.range.en, sp.duration.en,
                    sp.ritual ? "Ritual" : "", sp.concentration ? "Concentration" : "",
                  ].filter(Boolean)}
                  bodyPt={sp.text.pt}
                  bodyEn={sp.text.en}
                  level={sp.level}
                  classes={sp.classes}
                  onLevelClick={handleLevelClick}
                  onClassClick={handleClassClick}
                  tagKeys={keys}
                  onTagClick={toggleSpellTag}
                />
              );
            })}
          </div>
          <Pagination page={page} setPage={setPage} total={spellsSorted.length} pageSize={pageSize} />
        </>
      ) : (
        <>
          <Filters
            q={q} setQ={setQ}
            level={fLevel} setLevel={setFLevel}
            clazz={fClazz} setClazz={setFClazz}
            sort={fSort} setSort={setFSort}
            total={featuresSorted.length}
            pageSize={fPageSize} setPageSize={setFPageSize}
            onClearAll={()=>{ setQ(""); setFLevel("any"); setFClazz("any"); setFTags([]); setFSort("level-asc"); }}
            onClearLevel={()=>setFLevel("any")}
            onClearClazz={()=>setFClazz("any")}
            // tags
            tags={fTags} setTags={setFTags} onClearTags={()=>setFTags([])}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {fItems.map((ft) => {
              const keys = featureTagMap.get(ft.id) ?? [];
              return (
                <Card
                  key={ft.id}
                  id={ft.id}
                  kind="feature"
                  titlePt={ft.name.pt}
                  titleEn={ft.name.en}
                  schoolPt={ft.class}
                  schoolEn={ft.class}
                  pillsPt={[
                    `Nível ${ft.level}`,
                    ft.action?.pt ?? "",
                    ft.uses ? `Usos: ${ft.uses}` : "",
                  ].filter(Boolean)}
                  pillsEn={[
                    `Level ${ft.level}`,
                    ft.action?.en ?? "",
                    ft.uses ? `Uses: ${ft.uses}` : "",
                  ].filter(Boolean)}
                  bodyPt={ft.text.pt}
                  bodyEn={ft.text.en}
                  level={ft.level}
                  classes={[ft.class]}
                  onLevelClick={(l:number)=>setFLevel(l)}
                  onClassClick={(c:string)=>setFClazz(c)}
                  tagKeys={keys}
                  onTagClick={toggleFeatureTag}
                />
              );
            })}
          </div>
          <Pagination page={fPage} setPage={setFPage} total={featuresSorted.length} pageSize={fPageSize} />
        </>
      )}
    </div>
  );
}
