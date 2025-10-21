import { useEffect, useMemo, useState } from "react";
import { usePacks } from "../lib/state/packs";
import { SpellsArray, type TSpell } from "../lib/schema/spell";
import { pageRule, columns } from "../lib/print/layout";
import type { PageFormat, Orientation, Density } from "../lib/print/layout";
import CardPrint from "../components/CardPrint";
import PrintToolbar from "../components/PrintToolbar";
import "../styles/print.css";

export default function PrintPreview() {
  const { selected } = usePacks();

  // controles
  const [format, setFormat] = useState<PageFormat>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [density, setDensity] = useState<Density>("M");
  const [cutMarks, setCutMarks] = useState<boolean>(true);

  // injeta @page dinamicamente
  useEffect(() => {
    const style = document.createElement("style");
    style.media = "print";
    style.id = "page-rule";
    style.innerHTML = pageRule(format, orientation, 10);
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, [format, orientation]);

  // carregar dados (por enquanto só spells)
  const [spellById, setSpellById] = useState<Map<string, TSpell>>(new Map());
  useEffect(() => {
    import("../data/srd/spells.json").then((m) => {
      const arr = SpellsArray.parse(m.default);
      setSpellById(new Map(arr.map(s => [s.id, s])));
    });
  }, []);

  // resolve itens selecionados
  const cards = useMemo(() => {
    return selected.map(s => {
      if (s.kind !== "spell") return null; // only spells for now
      const sp = spellById.get(s.id);
      if (!sp) return null;
      return {
        key: s.kind + s.id,
        titlePt: sp.name.pt,
        titleEn: sp.name.en,
        schoolPt: sp.school?.pt ?? "",
        schoolEn: sp.school?.en ?? "",
        pills: [
          `Nível ${sp.level}`,
          sp.castingTime.pt,
          sp.range.pt,
          sp.duration.pt,
          sp.ritual ? "Ritual" : "",
          sp.concentration ? "Concentração" : ""
        ].filter(Boolean),
        bodyPt: sp.text.pt
      };
    }).filter(Boolean) as {
      key: string; titlePt: string; titleEn: string; schoolPt: string; schoolEn: string; pills: string[]; bodyPt: string;
    }[];
  }, [selected, spellById]);

  // columns per preferences
  const cols = columns(format, orientation, density);

  return (
    <div>
      <h2 className="no-print">Print Preview</h2>
      <PrintToolbar
        format={format} setFormat={setFormat}
        orientation={orientation} setOrientation={setOrientation}
        density={density} setDensity={setDensity}
        cutMarks={cutMarks} setCutMarks={setCutMarks}
        onPrint={()=>window.print()}
      />

      <div
        className={`print-grid print-${density}`}
        style={{ ["--cols" as any]: String(cols) }}
      >
        {cards.length === 0 && <em className="no-print">Nada selecionado. Vá em “Navegar” e selecione.</em>}
        {cards.map(c => (
          <CardPrint
            key={c.key}
            titlePt={c.titlePt}
            titleEn={c.titleEn}
            schoolPt={c.schoolPt}
            schoolEn={c.schoolEn}
            pills={c.pills}
            bodyPt={c.bodyPt}
            withCutMarks={cutMarks}
          />
        ))}
      </div>
    </div>
  );
}
