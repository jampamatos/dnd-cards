import { usePrefs } from "../lib/state/prefs";
import { TAG_CATALOG, TAG_ORDER, type TagKey } from "../lib/search/tags";

type Sort = "name-asc" | "level-asc" | "level-desc";

type FiltersProps = {
  q: string; setQ: (v:string)=>void;
  level: number | "any"; setLevel: (v:number|"any")=>void;
  clazz: string | "any"; setClazz: (v:string|"any")=>void;
  sort: Sort; setSort:(v:Sort)=>void;
  total: number; pageSize: number; setPageSize:(n:number)=>void;
  onClearAll: ()=>void;
  onClearLevel: ()=>void;
  onClearClazz: ()=>void;

  tags: TagKey[]; setTags: (v:TagKey[])=>void;
  onClearTags?: ()=>void;
};

const LEVELS = ["any",0,1,2,3,4,5,6,7,8,9] as const;

export default function Filters(p: FiltersProps) {
  const { lang } = usePrefs();
  const L = lang === "pt"
    ? {
        search: "Busca (PT/EN):",
        placeholder: "fireball, escudo, cura...",
        level: "Nível:",
        any: "Qualquer",
        clazz: "Classe:",
        sort: "Ordenar por:",
        nameAZ: "Nome (A→Z)",
        levelUp: "Nível (↑)",
        levelDown: "Nível (↓)",
        perPage: "Por página",
        tags: "Tags:",
        clearTags: "Limpar tags",
        clearAll: "Limpar filtros",
        results: (n:number)=> n===1 ? "resultado" : "resultados",
        levelChip: (n:number)=> `Nível ${n}`,
        classChip: (c:string)=> c,
        tagTitle: "Filtrar por tag",
      }
    : {
        search: "Search (PT/EN):",
        placeholder: "fireball, shield, healing...",
        level: "Level:",
        any: "Any",
        clazz: "Class:",
        sort: "Sort by:",
        nameAZ: "Name (A→Z)",
        levelUp: "Level (↑)",
        levelDown: "Level (↓)",
        perPage: "Per page",
        tags: "Tags:",
        clearTags: "Clear tags",
        clearAll: "Clear filters",
        results: (n:number)=> n===1 ? "result" : "results",
        levelChip: (n:number)=> `Level ${n}`,
        classChip: (c:string)=> c,
        tagTitle: "Filter by tag",
      };

  const label = (k: TagKey) => (lang === "pt" ? TAG_CATALOG[k].pt : TAG_CATALOG[k].en);

  function toggleTag(k: TagKey) {
    const has = p.tags.includes(k);
    p.setTags(has ? p.tags.filter(t => t !== k) : [...p.tags, k]);
  }

  return (
    <div className="filters sticky container">
      <div className="filters-row">
        {/* inputs iguais, só sem inline styles */}
        <label>
          <span>{L.search}</span>
          <input value={p.q} onChange={e=>p.setQ(e.target.value)} placeholder={L.placeholder} />
        </label>
        <label>
          <span>{L.level}</span>
          <select value={String(p.level)} onChange={e=>p.setLevel(e.target.value==="any"?"any":Number(e.target.value))}>
            {LEVELS.map(l => <option key={String(l)} value={String(l)}>{l==="any"?L.any:`${lang==="pt"?"Nível":"Level"} ${l}`}</option>)}
          </select>
        </label>
        <label>
          <span>{L.clazz}</span>
          <select value={p.clazz} onChange={e=>p.setClazz(e.target.value)}>
            <option value="any">{L.any}</option>
            {["Artificer","Bard","Cleric","Druid","Paladin","Ranger","Sorcerer","Wizard","Warlock"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <span>{L.sort}</span>
          <select value={p.sort} onChange={e=>p.setSort(e.target.value as Sort)}>
            <option value="name-asc">{L.nameAZ}</option>
            <option value="level-asc">{L.levelUp}</option>
            <option value="level-desc">{L.levelDown}</option>
          </select>
        </label>
        <label>
          <span>{L.perPage} ({p.total}):</span>
          <select value={String(p.pageSize)} onChange={e=>p.setPageSize(Number(e.target.value))}>
            {[8,12,16,24,36].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      <div className="chips" style={{ alignItems:"center" }}>
        <span style={{ opacity:.8 }}>{L.tags}</span>
        {TAG_ORDER.map((k) => {
          const active = p.tags.includes(k);
          return (
            <button key={k} onClick={()=>toggleTag(k)}
              className={`chip ${active?"chip--active":""}`} title={L.tagTitle}>
              #{label(k)}
            </button>
          );
        })}
        {p.tags.length > 0 && (
          <button onClick={p.onClearTags ?? (()=>p.setTags([]))} className="btn" style={{ marginLeft:"auto" }}>
            {L.clearTags}
          </button>
        )}
      </div>

      <div className="chips" style={{ alignItems:"center" }}>
        <strong>{p.total} {L.results(p.total)}</strong>
        {p.level!=="any" && <button onClick={p.onClearLevel} className="chip">{L.levelChip(p.level as number)} ✕</button>}
        {p.clazz!=="any" && <button onClick={p.onClearClazz} className="chip">{L.classChip(p.clazz)} ✕</button>}
        {p.tags.map((k)=>(
          <button key={k} onClick={()=>toggleTag(k)} className="chip">#{label(k)} ✕</button>
        ))}
        {(p.level!=="any" || p.clazz!=="any" || p.q || p.tags.length>0) &&
          <button onClick={p.onClearAll} className="btn" style={{ marginLeft:"auto" }}>{L.clearAll}</button>}
      </div>
    </div>
  );
}
