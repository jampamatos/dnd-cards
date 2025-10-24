import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePacks } from "../lib/state/packs";
import { SpellsArray } from "../lib/schema/spell";
import { FeaturesArray } from "../lib/schema/feature"; // <— estava faltando
import type { TSpell } from "../lib/schema/spell";
import type { TFeature } from "../lib/schema/feature";

type IndexMaps = {
  spellById: Map<string, TSpell>;
  featureById: Map<string, TFeature>;
};

export default function PackBuilder() {
  const { selected, remove, clear } = usePacks();
  const [maps, setMaps] = useState<IndexMaps>({
    spellById: new Map(),
    featureById: new Map()
  });

  useEffect(() => {
    Promise.all([
      import("../data/srd/spells.json").then(m => SpellsArray.parse(m.default)),
      import("../data/srd/features.json").then(m => FeaturesArray.parse(m.default))
    ]).then(([sp, ft]) => {
      setMaps({
        spellById: new Map(sp.map((s: TSpell) => [s.id, s])),
        featureById: new Map(ft.map((f: TFeature) => [f.id, f]))
      });
    });
  }, []);

  const items = selected.map((s) => {
    if (s.kind === "spell") {
      const sp = maps.spellById.get(s.id);
      if (!sp) return null;
      return (
        <li key={s.kind + s.id} style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
          <span><strong>{sp.name.pt}</strong> <span style={{opacity:.7}}>({sp.name.en})</span> — Nível {sp.level}</span>
          <button onClick={() => remove(s.id, s.kind)} style={{ border:"1px solid #ccc", borderRadius:6, padding:"2px 8px" }}>Remover</button>
        </li>
      );
    }
    if (s.kind === "feature") {
      const ft = maps.featureById.get(s.id);
      if (!ft) return null;
      return (
        <li key={s.kind + s.id} style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
          <span><strong>{ft.name.pt}</strong> <span style={{opacity:.7}}>({ft.name.en})</span> — {ft.class} • Nível {ft.level}</span>
          <button onClick={() => remove(s.id, s.kind)} style={{ border:"1px solid #ccc", borderRadius:6, padding:"2px 8px" }}>Remover</button>
        </li>
      );
    }
    return null;
  }).filter(Boolean);

    return (
      <div>
        <h2>Pack Builder</h2>
        <p>Itens selecionados: {selected.length}</p>
        <div style={{ display:"flex", gap:8, margin:"8px 0" }}>
          <button onClick={clear} style={{ border:"1px solid #ccc", borderRadius:8, padding:"6px 10px" }}>Limpar tudo</button>
          <Link to="/print">
            <button style={{ border:"1px solid #ccc", borderRadius:8, padding:"6px 10px" }}>Ir para Imprimir</button>
          </Link>
        </div>
        <ul style={{ display:"grid", gap:8, paddingLeft:18 }}>
          {items.length ? items : <em>Nada selecionado ainda. Vá em “Navegar”.</em>}
        </ul>
      </div>
    );
}