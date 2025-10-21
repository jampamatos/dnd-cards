import { useEffect, useState } from "react";

type FiltersProps = {
    q: string; setQ: (v:string)=>void;
    level: number | "any"; setLevel: (v:number|"any")=>void;
    clazz: string | "any"; setClazz: (v:string|"any")=>void;
    total: number; pageSize: number; setPageSize:(n:number)=>void;
};

const LEVELS = ["any",0,1,2,3,4,5,6,7,8,9] as const;

export default function Filters({
    q, setQ, level, setLevel, clazz, setClazz, total, pageSize, setPageSize
}: FiltersProps) {
    const [localQ, setLocalQ] = useState(q);
    useEffect(() => setLocalQ(q), [q]); // keeps local in sync when parent changes
    useEffect(() => {
        const t = setTimeout(() => setQ(localQ), 300);
        return () => clearTimeout(t);
    }, [localQ, setQ]);
    return (
        <div style={{ display:"grid", gap:8, gridTemplateColumns:"1fr repeat(3, max-content)", alignItems:"end", margin:"8px 0 12px" }}>
          <label style={{ display:"grid" }}>
            <span>Busca (PT/EN):</span>
            <input
              value={localQ}
              onChange={e=>setLocalQ(e.target.value)}
              onBlur={() => setQ(localQ)}                                   // flush on blur
              onKeyDown={(e) => { if (e.key === "Enter") setQ(localQ); }}   // flush on Enter
              placeholder="fireball, escudo, cura..."
              style={{ padding:"6px 8px", border:"1px solid #ccc", borderRadius:6 }}
            />
          </label>
    
          <label style={{ display:"grid" }}>
            <span>Nível:</span>
            <select value={String(level)} onChange={e=>{
              const v = e.target.value === "any" ? "any" : Number(e.target.value);
              setLevel(v);
            }}>
              {LEVELS.map(l => <option key={String(l)} value={String(l)}>{l==="any"?"Qualquer":`Nível ${l}`}</option>)}
            </select>
          </label>
    
          <label style={{ display:"grid" }}>
            <span>Classe:</span>
            <select value={clazz} onChange={e=>setClazz(e.target.value)}>
              <option value="any">Qualquer</option>
              {["Artificer","Bard","Cleric","Druid","Paladin","Ranger","Sorcerer","Wizard"].map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
          </label>
    
          <label style={{ display:"grid" }}>
            <span>Por página ({total} resultados):</span>
            <select value={String(pageSize)} onChange={e=>setPageSize(Number(e.target.value))}>
              {[8,12,16,24,36].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
    );
}