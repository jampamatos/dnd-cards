import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePacks } from "../lib/state/packs";
import { SpellsArray } from "../lib/schema/spell";
import type { TSpell } from "../lib/schema/spell";

type IndexMaps = {
    spellById: Map<string, TSpell>;
};

export default function PackBuilder() {
    const { selected, remove, clear } = usePacks();
    const [maps, setMaps] = useState<IndexMaps>({ spellById: new Map() });

    useEffect(() => {
        // only spells for now; in the future we'll load features, beasts, etc.
        import("../data/srd/spells.json")
          .then((m) => {
            const spells = SpellsArray.parse(m.default);
            setMaps({ spellById: new Map(spells.map(s => [s.id, s])) });
        });
    }, []);

    const items = selected.map((s) => {
        if (s.kind === "spell") {
            const sp = maps.spellById.get(s.id);
            if (!sp) return null;
            return (
                <li key={s.kind + s.id} style={{ display:"flex", justifyContent:"space-between",gap:12 }}>
                    <span><strong>{sp.name.pt}</strong> <span style={{opacity:.7}}>({sp.name.en})</span> — Nível {sp.level}</span>
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