import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePacks } from "../lib/state/packs";
import { SpellsArray } from "../lib/schema/spell";
import { FeaturesArray } from "../lib/schema/feature";
import type { TSpell } from "../lib/schema/spell";
import type { TFeature } from "../lib/schema/feature";
import { usePrefs } from "../lib/state/prefs";

type IndexMaps = {
  spellById: Map<string, TSpell>;
  featureById: Map<string, TFeature>;
};

export default function PackBuilder() {
  const { lang } = usePrefs();
  const L = lang === "pt"
    ? {
        title: "Montar Pacote",
        selected: "Itens selecionados",
        remove: "Remover",
        clearAll: "Limpar tudo",
        goToPrint: "Ir para Imprimir",
        nothing: "Nada selecionado ainda. Vá em “Navegar”.",
        level: "Nível",
        klass: (c: string) => c,
        browse: "Navegar",
      }
    : {
        title: "Pack Builder",
        selected: "Selected items",
        remove: "Remove",
        clearAll: "Clear all",
        goToPrint: "Go to Print",
        nothing: "Nothing selected yet. Go to “Browse”.",
        level: "Level",
        klass: (c: string) => c,
        browse: "Browse",
      };

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
          <span>
            <strong>{sp.name.pt}</strong> <span style={{opacity:.7}}>({sp.name.en})</span> — {L.level} {sp.level}
          </span>
          <button onClick={() => remove(s.id, s.kind)} style={{ border:"1px solid #ccc", borderRadius:6, padding:"2px 8px" }}>
            {L.remove}
          </button>
        </li>
      );
    }
    if (s.kind === "feature") {
      const ft = maps.featureById.get(s.id);
      if (!ft) return null;
      return (
        <li key={s.kind + s.id} style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
          <span>
            <strong>{ft.name.pt}</strong> <span style={{opacity:.7}}>({ft.name.en})</span> — {L.klass(ft.class)} • {L.level} {ft.level}
          </span>
          <button onClick={() => remove(s.id, s.kind)} style={{ border:"1px solid #ccc", borderRadius:6, padding:"2px 8px" }}>
            {L.remove}
          </button>
        </li>
      );
    }
    return null;
  }).filter(Boolean);

  return (
    <div>
      <h2>{L.title}</h2>
      <p>{L.selected}: {selected.length}</p>
      <div style={{ display:"flex", gap:8, margin:"8px 0" }}>
        <button onClick={clear} style={{ border:"1px solid #ccc", borderRadius:8, padding:"6px 10px" }}>{L.clearAll}</button>
        <Link to="/print">
          <button style={{ border:"1px solid #ccc", borderRadius:8, padding:"6px 10px" }}>{L.goToPrint}</button>
        </Link>
      </div>
      <ul style={{ display:"grid", gap:8, paddingLeft:18 }}>
        {items.length ? items : <em>{L.nothing}</em>}
      </ul>
    </div>
  );
}
