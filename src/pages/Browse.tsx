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
import { detectSpellTags, detectFeatureTags, TAG_ORDER, type TagKey } from "../lib/search/tags";
import { usePrefs } from "../lib/state/prefs";
import { formatClassName } from "../lib/format";
import { buildFeaturePills, buildSpellPills } from "../lib/pills";

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

const normalizeText = (text: string): string => {
  try {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  } catch {
    return text.toLowerCase();
  }
};

const collectIdsByKind = <T extends { id: string; name: { pt: string; en: string } }>(
  mini: MiniSearch<UnifiedDoc> | null,
  query: string,
  kind: HitKind,
  items: T[]
): string[] | null => {
  const trimmed = query.trim();
  if (!mini || !trimmed) return null;
  const hits = (mini.search(trimmed, { prefix: true }) as SearchHit[])
    .map(toPickedHit)
    .filter(isPickedHit)
    .filter((hit) => hit.kind === kind)
    .map((hit) => hit.id);

  if (hits.length === 0) return hits;

  const normalizedQuery = normalizeText(trimmed);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return hits;

  const map = new Map(items.map((item) => [item.id, item]));
  const directMatches = hits.filter((id) => {
    const item = map.get(id);
    if (!item) return false;
    const names = [item.name?.pt ?? "", item.name?.en ?? ""]
      .map((name) => normalizeText(name))
      .filter(Boolean);
    if (names.length === 0) return false;
    if (names.some((name) => name.includes(normalizedQuery))) return true;
    if (tokens.length === 1) {
      const token = tokens[0]!;
      return names.some((name) => name.includes(token));
    }
    return tokens.every((token) => names.some((name) => name.includes(token)));
  });

  if (directMatches.length > 0) return directMatches;
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
  const [level, setLevel] = useState<number[]>([]);
  const [clazz, setClazz] = useState<string | "any">("any");
  const [school, setSchool] = useState<string | "any">("any");
  const [tags, setTags] = useState<TagKey[]>([]);
  const [sort, setSort] = useState<SortOption>("level-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // features state
  const [features, setFeatures] = useState<TFeature[]>([]);
  const [fLevel, setFLevel] = useState<number[]>([]);
  const [fClazz, setFClazz] = useState<string | "any">("any");
  const [fTags, setFTags] = useState<TagKey[]>([]);
  const [fSort, setFSort] = useState<SortOption>("level-asc");
  const [fPage, setFPage] = useState(1);
  const [fPageSize, setFPageSize] = useState(12);

  const [error, setError] = useState<string | null>(null);
  const { lang } = usePrefs();

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
  const { map: spellTagMap, options: spellTagOptions } = useMemo(() => {
    const map = new Map<string, TagKey[]>();
    const used = new Set<TagKey>();
    for (const sp of spells) {
      const keys = detectSpellTags(sp);
      map.set(sp.id, keys);
      for (const key of keys) used.add(key);
    }
    return {
      map,
      options: TAG_ORDER.filter((key) => used.has(key)),
    };
  }, [spells]);

  const { map: featureTagMap, options: featureTagOptions } = useMemo(() => {
    const map = new Map<string, TagKey[]>();
    const used = new Set<TagKey>();
    for (const ft of features) {
      const keys = detectFeatureTags(ft);
      map.set(ft.id, keys);
      for (const key of keys) used.add(key);
    }
    return {
      map,
      options: TAG_ORDER.filter((key) => used.has(key)),
    };
  }, [features]);

  const spellLevels = useMemo(() => {
    const set = new Set<number>();
    for (const sp of spells) set.add(sp.level);
    return Array.from(set).sort((a, b) => a - b);
  }, [spells]);

  const spellClassOptions = useMemo(() => {
    const set = new Set<string>();
    for (const sp of spells) {
      for (const c of sp.classes) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [spells]);

  const spellSchoolOptions = useMemo(() => {
    const set = new Set<string>();
    for (const sp of spells) {
      const key = sp.school?.en;
      if (key) set.add(key);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [spells]);

  const featureLevels = useMemo(() => {
    const set = new Set<number>();
    for (const ft of features) set.add(ft.level);
    return Array.from(set).sort((a, b) => a - b);
  }, [features]);

  const featureClassOptions = useMemo(() => {
    const set = new Set<string>();
    for (const ft of features) set.add(ft.class);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
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
    const ids = collectIdsByKind(mini, q, "spell", spells);
    let arr = filterByIds(spells.slice(), ids, (s) => s.id);
    if (level.length > 0) arr = arr.filter((s) => level.includes(s.level));
    if (clazz !== "any") arr = arr.filter((s) => s.classes.includes(clazz));
    if (school !== "any") arr = arr.filter((s) => (s.school?.en ?? "") === school);
    if (tags.length > 0) {
      arr = arr.filter((s) => hasAllTags(spellTagMap.get(s.id), tags));
    }
    return arr;
  }, [mini, spells, q, level, clazz, school, tags, spellTagMap]);

  const spellsSorted = useMemo(() => sortByOption(spellsFiltered, sort), [spellsFiltered, sort]);
  const sStart = (page-1) * pageSize;
  const sItems = spellsSorted.slice(sStart, sStart + pageSize);
  useEffect(()=>{ setPage(1); }, [q, level, clazz, school, tags, pageSize, sort]);
  useEffect(() => {
    if (level.length === 0) return;
    const allowed = level.filter((l) => spellLevels.includes(l));
    const normalized = Array.from(new Set(allowed)).sort((a, b) => a - b);
    const sameLength = normalized.length === level.length;
    const sameOrder = sameLength && normalized.every((value, index) => value === level[index]);
    if (!sameOrder) setLevel(normalized);
  }, [level, spellLevels]);
  useEffect(() => {
    if (school !== "any" && !spellSchoolOptions.includes(school)) setSchool("any");
  }, [school, spellSchoolOptions]);

  function handleLevelClick(l:number){ setLevel([l]); window.scrollTo({top:0, behavior:"smooth"}); }
  function handleClassClick(c:string){ setClazz(c); window.scrollTo({top:0, behavior:"smooth"}); }
  function clearAllSpells(){ setQ(""); setLevel([]); setClazz("any"); setSchool("any"); setTags([]); setSort("level-asc"); }

  // features pipeline
  const featuresFiltered = useMemo(() => {
    const ids = collectIdsByKind(mini, q, "feature", features);
    let arr = filterByIds(features.slice(), ids, (f) => f.id);
    if (fLevel.length > 0) arr = arr.filter((f) => fLevel.includes(f.level));
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
  useEffect(() => {
    if (fLevel.length === 0) return;
    const allowed = fLevel.filter((l) => featureLevels.includes(l));
    const normalized = Array.from(new Set(allowed)).sort((a, b) => a - b);
    const sameLength = normalized.length === fLevel.length;
    const sameOrder = sameLength && normalized.every((value, index) => value === fLevel[index]);
    if (!sameOrder) setFLevel(normalized);
  }, [fLevel, featureLevels]);

  if (error) {
    const errorLabel = lang === "pt" ? "Erro carregando dados" : "Error loading data";
    return (
      <section className="page container">
        <p style={{ color: "crimson" }}>{errorLabel}: {error}</p>
      </section>
    );
  }

  const L = lang === "pt"
      ? { title: "Navegar", spells: "Magias", features: "Características" }
      : { title: "Browse",   spells: "Spells", features: "Features" };

  return (
    <section className="page">
      <div className="container">
        <h1>{L.title}</h1>
      </div>

      <div className="no-print segmented container">
        <button onClick={() => setTab("spells")}
                className="seg"
                aria-pressed={tab === "spells"}>
          {L.spells}
        </button>
        <button onClick={() => setTab("features")}
                className="seg"
                aria-pressed={tab === "features"}>
          {L.features}
        </button>
      </div>

      {tab === "spells" ? (
        <>
          <Filters
            q={q} setQ={setQ}
            level={level} setLevel={setLevel}
            levelOptions={spellLevels}
            clazz={clazz} setClazz={setClazz}
            school={school} setSchool={setSchool}
            schoolOptions={spellSchoolOptions}
            sort={sort} setSort={setSort}
            total={spellsSorted.length}
            pageSize={pageSize} setPageSize={setPageSize}
            onClearAll={clearAllSpells}
            onClearClazz={()=>setClazz("any")}
            onClearSchool={()=>setSchool("any")}
            classOptions={spellClassOptions}
            tagOptions={spellTagOptions}
            tags={tags} setTags={setTags} onClearTags={()=>setTags([])}
            kind="spell"
          />
          <div className="grid-cards container">
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
                  pillsPt={buildSpellPills(sp, "pt")}
                  pillsEn={buildSpellPills(sp, "en")}
                  bodyPt={sp.text.pt}
                  bodyEn={sp.text.en}
                  components={{
                    verbal: sp.components?.verbal,
                    somatic: sp.components?.somatic,
                    material:sp.components?.material,
                  }}
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
            levelOptions={featureLevels}
            clazz={fClazz} setClazz={setFClazz}
            sort={fSort} setSort={setFSort}
            total={featuresSorted.length}
            pageSize={fPageSize} setPageSize={setFPageSize}
            onClearAll={()=>{ setQ(""); setFLevel([]); setFClazz("any"); setFTags([]); setFSort("level-asc"); }}
            onClearClazz={()=>setFClazz("any")}
            classOptions={featureClassOptions}
            tagOptions={featureTagOptions}
            tags={fTags} setTags={setFTags} onClearTags={()=>setFTags([])}
            kind="feature"
          />
          <div className="grid-cards container">
            {fItems.map((ft) => {
              const keys = featureTagMap.get(ft.id) ?? [];
              return (
                <Card
                  key={ft.id}
                  id={ft.id}
                  kind="feature"
                  titlePt={ft.name.pt}
                  titleEn={ft.name.en}
                  schoolPt={formatClassName(ft.class, "pt")}
                  schoolEn={formatClassName(ft.class, "en")}
                  pillsPt={buildFeaturePills(ft, "pt")}
                  pillsEn={buildFeaturePills(ft, "en")}
                  bodyPt={ft.text.pt}
                  bodyEn={ft.text.en}
                  level={ft.level}
                  classes={[ft.class]}
                  onLevelClick={(l:number)=>setFLevel([l])}
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
    </section>
  );
}
