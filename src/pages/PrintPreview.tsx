import { useEffect, useMemo, useState } from "react";
import { usePacks } from "../lib/state/packs";
import { SpellsArray, type TSpell } from "../lib/schema/spell";
import { pageRule, columns } from "../lib/print/layout";
import { usePrefs } from "../lib/state/prefs";
import type { PageFormat, Orientation, Density } from "../lib/print/layout";
import CardPrint from "../components/CardPrint";
import PrintToolbar from "../components/PrintToolbar";
import "../styles/print.css";

export default function PrintPreview() {
  const { selected } = usePacks();
  const { lang } = usePrefs();

  // controllah_(gorillaz_feat_mc_bin_laden).mp3
  const [format, setFormat] = useState<PageFormat>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [density, setDensity] = useState<Density>("M");
  const [cutMarks, setCutMarks] = useState<boolean>(true);
  const [showHeader, setShowHeader] = useState<boolean>(true);
  const [headerTitle, setHeaderTitle] = useState<string>("D&D Cards");

  // inject @page dynamically
  useEffect(() => {
    const style = document.createElement("style");
    style.media = "print";
    style.id = "page-rule";
    style.innerHTML = pageRule(format, orientation, 10);
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, [format, orientation]);

  // load data (only spells for now)
  const [spellById, setSpellById] = useState<Map<string, TSpell>>(new Map());
  useEffect(() => {
    import("../data/srd/spells.json").then((m) => {
      const arr = SpellsArray.parse(m.default);
      setSpellById(new Map(arr.map(s => [s.id, s])));
    });
  }, []);

  // resolves selected items
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
        pillsPt: [
          `Nível ${sp.level}`,
          sp.castingTime.pt,
          sp.range.pt,
          sp.duration.pt,
          sp.ritual ? "Ritual" : "",
          sp.concentration ? "Concentração" : ""
        ].filter(Boolean),
        pillsEn: [
          `Level ${sp.level}`,
          sp.castingTime.en,
          sp.range.en,
          sp.duration.en,
          sp.ritual ? "Ritual" : "",
          sp.concentration ? "Concentration" : ""
        ].filter(Boolean),
        bodyPt: sp.text.pt,
        bodyEn: sp.text.en,
      };
    }).filter(Boolean) as {
      key: string; titlePt: string; titleEn: string; schoolPt: string; schoolEn: string; pillsPt: string[]; pillsEn: string[]; bodyPt: string; bodyEn: string;
    }[];
  }, [selected, spellById]);

  // columns per preferences
  const cols = columns(format, orientation, density);
  const total = cards.length;
  const stamp = useMemo(() => {
    const d = new Date();
    const date = d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US");
    const time = d.toLocaleTimeString(lang === "pt" ? "pt-BR" : "en-US", { hour: "2-digit", minute: "2-digit" });
    return `${date} • ${time}`;
  }, [lang]);

  const L = lang === "pt"
    ? { title: "Pré-visualização de Impressão", card: "carta", cards: "cartas", empty: "Nada selecionado. Vá em “Navegar” e selecione." }
    : { title: "Print Preview", card: "card", cards: "cards", empty: "Nothing selected. Go to “Browse” and select." };

  return (
    <div>
      <h2 className="no-print">Print Preview</h2>
      <PrintToolbar
        format={format} setFormat={setFormat}
        orientation={orientation} setOrientation={setOrientation}
        density={density} setDensity={setDensity}
        cutMarks={cutMarks} setCutMarks={setCutMarks}
        showHeader={showHeader} setShowHeader={setShowHeader}
        headerTitle={headerTitle} setHeaderTitle={setHeaderTitle}
        onPrint={()=>window.print()}
      />

      {showHeader && (
        <div className="print-header">
          <h1>{headerTitle}</h1>
          <div className="meta">
            {total} {total === 1 ? L.card : L.cards} • {stamp}
          </div>
        </div>
      )}

      <main
        style={{ ["--cols" as any]: String(cols) }}
        role="main"
        className={`print-grid print-${density} print-content`}
      >
        {cards.length === 0 && <em className="no-print">{L.empty}</em>}
        {cards.map(c => (
          <CardPrint
            key={c.key}
            titlePt={c.titlePt} titleEn={c.titleEn}
            schoolPt={c.schoolPt} schoolEn={c.schoolEn}
            pillsPt={c.pillsPt} pillsEn={c.pillsEn}
            bodyPt={c.bodyPt} bodyEn={c.bodyEn}
            withCutMarks={cutMarks}
            lang={lang}
          />
        ))}
      </main>
    </div>
  );
}
