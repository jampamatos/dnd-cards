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

// Shared list so dropdown and clearing logic stay in sync with spell levels
const LEVELS = ["any",0,1,2,3,4,5,6,7,8,9] as const;

export default function Filters(p: FiltersProps) {
  const { lang } = usePrefs();
  const label = (k: TagKey) => (lang === "pt" ? TAG_CATALOG[k].pt : TAG_CATALOG[k].en);

  function toggleTag(k: TagKey) {
    // toggle to add/remove tag, delegating state control to the parent component
    const has = p.tags.includes(k);
    p.setTags(has ? p.tags.filter(t => t !== k) : [...p.tags, k]);
  }

  return (
    <div style={{ display:"grid", gap:8 }}>
      <div style={{ display:"grid", gap:8, gridTemplateColumns:"1fr repeat(4, max-content)", alignItems:"end" }}>
        <label style={{ display:"grid" }}>
          <span>Busca (PT/EN):</span>
          <input
            value={p.q}
            onChange={e=>p.setQ(e.target.value)}
            placeholder="fireball, escudo, cura..."
            style={{ padding:"6px 8px", border:"1px solid #ccc", borderRadius:6 }}
          />
        </label>

        <label style={{ display:"grid" }}>
          <span>Nível:</span>
          <select value={String(p.level)} onChange={e=>p.setLevel(e.target.value==="any"?"any":Number(e.target.value))}>
            {LEVELS.map(l => <option key={String(l)} value={String(l)}>{l==="any"?"Qualquer":`Nível ${l}`}</option>)}
          </select>
        </label>

        <label style={{ display:"grid" }}>
          <span>Classe:</span>
          <select value={p.clazz} onChange={e=>p.setClazz(e.target.value)}>
            <option value="any">Qualquer</option>
            {["Artificer","Bard","Cleric","Druid","Paladin","Ranger","Sorcerer","Wizard","Warlock"]
              .map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label style={{ display:"grid" }}>
          <span>Ordenar por:</span>
          <select value={p.sort} onChange={e=>p.setSort(e.target.value as Sort)}>
            <option value="name-asc">Nome (A→Z)</option>
            <option value="level-asc">Nível (↑)</option>
            <option value="level-desc">Nível (↓)</option>
          </select>
        </label>

        <label style={{ display:"grid" }}>
          <span>Por página ({p.total}):</span>
          <select value={String(p.pageSize)} onChange={e=>p.setPageSize(Number(e.target.value))}>
            {[8,12,16,24,36].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      {/* Tag palette */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ opacity:.8 }}>{lang==="pt"?"Tags:":"Tags:"}</span>
        {TAG_ORDER.map((k) => {
          const active = p.tags.includes(k);
          return (
            <button
              key={k}
              onClick={()=>toggleTag(k)}
              style={{
                fontSize:12,
                border:"1px solid " + (active ? "#3b82f6" : "#ccc"),
                color: active ? "#0b57d0" : "inherit",
                background: active ? "#eef5ff" : "#fff",
                borderRadius:999, padding:"2px 10px", cursor:"pointer"
              }}
              title={lang==="pt"?"Filtrar por tag":"Filter by tag"}
            >
              #{label(k)}
            </button>
          );
        })}

        {p.tags.length > 0 && (
          <button
            onClick={p.onClearTags ?? (()=>p.setTags([]))}
            style={{ marginLeft:"auto", border:"1px solid #ccc", borderRadius:8, padding:"6px 10px" }}
          >
            {lang==="pt"?"Limpar tags":"Clear tags"}
          </button>
        )}
      </div>

      {/* Active filter chips */}
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
        <strong>{p.total} resultado(s)</strong>

        {p.level!=="any" &&
          <button onClick={p.onClearLevel} style={{ border:"1px solid #ccc", borderRadius:999, padding:"2px 10px" }}>
            Nível {p.level} ✕
          </button>}

        {p.clazz!=="any" &&
          <button onClick={p.onClearClazz} style={{ border:"1px solid #ccc", borderRadius:999, padding:"2px 10px" }}>
            {p.clazz} ✕
          </button>}

        {p.tags.map((k)=>(
          <button
            key={k}
            onClick={()=>toggleTag(k)}
            style={{ border:"1px solid #ccc", borderRadius:999, padding:"2px 10px" }}
          >
            #{label(k)} ✕
          </button>
        ))}

        {(p.level!=="any" || p.clazz!=="any" || p.q || p.tags.length>0) &&
          <button onClick={p.onClearAll} style={{ marginLeft:"auto", border:"1px solid #ccc", borderRadius:8, padding:"6px 10px" }}>
            Limpar filtros
          </button>}
      </div>
    </div>
  );
}
