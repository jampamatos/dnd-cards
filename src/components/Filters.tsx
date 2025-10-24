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
};

const LEVELS = ["any",0,1,2,3,4,5,6,7,8,9] as const;

export default function Filters(p: FiltersProps) {
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
        {(p.level!=="any" || p.clazz!=="any" || p.q) &&
          <button onClick={p.onClearAll} style={{ marginLeft:"auto", border:"1px solid #ccc", borderRadius:8, padding:"6px 10px" }}>
            Limpar filtros
          </button>}
      </div>
    </div>
  );
}
