import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { DragEvent } from "react";
import { usePacks } from "../lib/state/packs";
import { SpellsArray } from "../lib/schema/spell";
import { FeaturesArray } from "../lib/schema/feature";
import type { TSpell } from "../lib/schema/spell";
import type { TFeature } from "../lib/schema/feature";
import { columns } from "../lib/print/layout";
import PrintToolbar from "../components/PrintToolbar";
import CardPrint from "../components/CardPrint";
import CardBackPrint from "../components/CardBackPrint";
import { usePrefs } from "../lib/state/prefs";
import "../styles/print.css"
import { formatFeatureLevel, formatSpellLevel } from "../lib/format";

type CardVM = {
  key: string;
  titlePt: string; titleEn: string;
  schoolPt: string; schoolEn: string;
  pillsPt: string[]; pillsEn: string[];
  bodyPt: string; bodyEn: string;
  components?: TSpell["components"];
};

export default function PrintPreview() {
  const { selected } = usePacks();
  const { lang } = usePrefs();

  // toolbar state
  const [format, setFormat] = useState<"A4" | "Letter" | "A3">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [density, setDensity] = useState<"S" | "M" | "L">("M");
  const [cutMarks, setCutMarks] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [headerTitle, setHeaderTitle] = useState("D&D Cards");

  // builder state
  const [reorderMode, setReorderMode] = useState(false);
  const [colsOverride, setColsOverride] = useState<0 | 1 | 2>(0); // 0 = auto
  const [backsEnabled, setBacksEnabled] = useState(false);
  const [backsMirrorCols, setBacksMirrorCols] = useState(true);

  // data
  const [spells, setSpells] = useState<TSpell[]>([]);
  const [features, setFeatures] = useState<TFeature[]>([]);

  useEffect(() => {
    Promise.all([
      import("../data/srd/spells.json").then(m => SpellsArray.parse(m.default)),
      import("../data/srd/features.json").then(m => FeaturesArray.parse(m.default)),
    ]).then(([sp, ft]) => {
      setSpells(sp); setFeatures(ft);
    });
  }, []);

  // build VM list from selection
  const cardsRaw: CardVM[] = useMemo(() => {
    const out: CardVM[] = [];
    for (const it of selected) {
      if (it.kind === "spell") {
        const sp = spells.find(s => s.id === it.id);
        if (!sp) continue;
        out.push({
          key: "spell:" + sp.id,
          titlePt: sp.name.pt, titleEn: sp.name.en,
          schoolPt: sp.school.pt, schoolEn: sp.school.en,
          pillsPt: [
            formatSpellLevel(sp.level, "pt"),
            sp.castingTime.pt,
            sp.range.pt,
            sp.duration.pt,
            sp.ritual ? "Ritual" : "",
            sp.concentration ? "Concentração" : "",
          ].filter(Boolean),
          pillsEn: [
            formatSpellLevel(sp.level, "en"),
            sp.castingTime.en,
            sp.range.en,
            sp.duration.en,
            sp.ritual ? "Ritual" : "",
            sp.concentration ? "Concentration" : "",
          ].filter(Boolean),
          bodyPt: sp.text.pt, bodyEn: sp.text.en,
          components: sp.components,
        });
      } else {
        const ft = features.find(f => f.id === it.id);
        if (!ft) continue;
        out.push({
          key: "feature:" + ft.id,
          titlePt: ft.name.pt, titleEn: ft.name.en,
          schoolPt: ft.class, schoolEn: ft.class,
          pillsPt: [ formatFeatureLevel(ft.level, "pt"), ft.action?.pt ?? "" ].filter(Boolean),
          pillsEn: [ formatFeatureLevel(ft.level, "en"), ft.action?.en ?? "" ].filter(Boolean),
          bodyPt: ft.text.pt, bodyEn: ft.text.en,
        });
      }
    }
    return out;
  }, [selected, spells, features]);

  // reorder support (drag & drop)
  const [cards, setCards] = useState<CardVM[]>([]);
  useEffect(() => setCards(cardsRaw), [cardsRaw]);

  const dragIndex = useRef<number | null>(null);
  const onDragStart = (i: number) => (ev: React.DragEvent) => {
    dragIndex.current = i;
    ev.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (ev: DragEvent<HTMLDivElement>) => {
    if (!reorderMode) return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
  };
  const onDrop = (i: number) => (ev: React.DragEvent) => {
    ev.preventDefault();
    if (dragIndex.current === null) return;
    const from = dragIndex.current;
    const to = i;
    if (from === to) return;
    setCards((old) => {
      const temp = old.slice();
      const [moved] = temp.splice(from, 1);
      temp.splice(to, 0, moved);
      return temp;
    });
    dragIndex.current = null;
  };

  // compute columns
  const autoCols = columns(format, orientation, density);
  const cols = colsOverride === 0 ? autoCols : colsOverride;

  // timestamp
  const stamp = useMemo(() => {
    const d = new Date();
    const date = d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US");
    const time = d.toLocaleTimeString(lang === "pt" ? "pt-BR" : "en-US", { hour: "2-digit", minute: "2-digit" });
    return `${date} • ${time}`;
  }, [lang]);

  const L = lang === "pt"
    ? { title: "Pré-visualização de Impressão", card: "carta", cardsLbl: "cartas", empty: "Nada selecionado. Vá em “Navegar” e selecione." }
    : { title: "Print Preview", card: "card",   cardsLbl: "cards",  empty: "Nothing selected. Go to “Browse” and select." };

  // helper: mirror columns for backs
  function mirrorByColumns(list: CardVM[], columns: number): CardVM[] {
    if (columns <= 1) return list.slice();
    const out: CardVM[] = [];
    for (let i = 0; i < list.length; i += columns) {
      const row = list.slice(i, i + columns);
      out.push(...row.reverse());
    }
    return out;
  }

  // print action
  function handlePrint() {
    window.print();
  }

  const gridStyle: CSSProperties & { [key: `--${string}`]: string } = {
    "--cols": String(cols),
  };

  return (
    <section className="page">
      <div className="container no-print">
        <h1>{L.title}</h1>
      </div>

      <PrintToolbar
        format={format} setFormat={setFormat}
        orientation={orientation} setOrientation={setOrientation}
        density={density} setDensity={setDensity}
        cutMarks={cutMarks} setCutMarks={setCutMarks}
        showHeader={showHeader} setShowHeader={setShowHeader}
        headerTitle={headerTitle} setHeaderTitle={setHeaderTitle}
        reorderMode={reorderMode} setReorderMode={setReorderMode}
        colsOverride={colsOverride} setColsOverride={setColsOverride}
        backsEnabled={backsEnabled} setBacksEnabled={setBacksEnabled}
        backsMirrorCols={backsMirrorCols} setBacksMirrorCols={setBacksMirrorCols}
        onPrint={handlePrint}
      />

      {showHeader && (
        <div className="print-header">
          <h1>{headerTitle}</h1>
          <div className="meta">
            {cards.length} {cards.length === 1 ? L.card : L.cardsLbl} • {stamp}
          </div>
        </div>
      )}

      {/* FRONT PAGES */}
      <section
        style={gridStyle}
        className={`print-grid print-${density} print-content`}
        aria-label={lang === "pt" ? "Cartas para impressão" : "Cards ready for print"}
      >
        {cards.length === 0 && <em className="no-print">{L.empty}</em>}
        {cards.map((c, i) => {
          const draggable = reorderMode;
          return (
            <div
              key={c.key}
              draggable={draggable}
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={onDrop(i)}
              title={draggable ? (lang === "pt" ? "Arraste para reordenar" : "Drag to reorder") : undefined}
              style={draggable ? { outline:"1px dashed var(--border)", borderRadius:8 } : undefined}
            >
              <CardPrint
                titlePt={c.titlePt} titleEn={c.titleEn}
                schoolPt={c.schoolPt} schoolEn={c.schoolEn}
                pillsPt={c.pillsPt} pillsEn={c.pillsEn}
                bodyPt={c.bodyPt} bodyEn={c.bodyEn}
                components={{
                  verbal: c.components?.verbal,
                  somatic: c.components?.somatic,
                  material: c.components?.material,
                }}
                withCutMarks={cutMarks}
                lang={lang}
              />
            </div>
          );
        })}
      </section>

      {/* BACK PAGES */}
      {backsEnabled && (
        <>
          <div className="print-page-break" />
          {showHeader && (
            <div className="print-header">
              <h1>{headerTitle}</h1>
              <div className="meta">
                {cards.length} {cards.length === 1 ? L.card : L.cardsLbl} • {stamp}
              </div>
            </div>
          )}
          <section
            style={gridStyle}
            className={`print-grid print-${density} print-content`}
            aria-label={lang === "pt" ? "Versos das cartas" : "Card backs"}
          >
            { (backsMirrorCols ? mirrorByColumns(cards, cols) : cards).map((c) => (
              <CardBackPrint
                key={"back:" + c.key}
                titlePt={c.titlePt} titleEn={c.titleEn}
                withCutMarks={cutMarks}
                lang={lang}
              />
            ))}
          </section>
        </>
      )}
    </section>
  );
}
