import { usePrefs } from "../lib/state/prefs";
import type { PageFormat, Orientation, Density } from "../lib/print/layout";

type Props = {
  format: PageFormat; setFormat: (v: PageFormat) => void;
  orientation: Orientation; setOrientation: (v: Orientation) => void;
  density: Density; setDensity: (v: Density) => void;
  cutMarks: boolean; setCutMarks: (v: boolean) => void;
  showHeader: boolean; setShowHeader: (v: boolean) => void;
  headerTitle: string; setHeaderTitle: (v: string) => void;
  onPrint: () => void;
};

export default function PrintToolbar({
  format, setFormat,
  orientation, setOrientation,
  density, setDensity,
  cutMarks, setCutMarks,
  showHeader, setShowHeader,
  headerTitle, setHeaderTitle,
  onPrint
}: Props) {
  const { lang } = usePrefs();

  const L = lang === "pt"
    ? {
        format: "Formato",
        orientation: "Orientação",
        portrait: "Retrato",
        landscape: "Paisagem",
        density: "Densidade",
        cut: "Linhas de corte",
        headers: "Cabeçalhos",
        title: "Título",
        print: "Imprimir / PDF",
      }
    : {
        format: "Format",
        orientation: "Orientation",
        portrait: "Portrait",
        landscape: "Landscape",
        density: "Density",
        cut: "Cut marks",
        headers: "Headers",
        title: "Title",
        print: "Print / PDF",
      };

  return (
    <div className="no-print" style={{ display:"flex", gap:12, alignItems:"center", padding:"8px 0", flexWrap:"wrap" }}>
      <label>{L.format}:
        <select value={format} onChange={e=>setFormat(e.target.value as PageFormat)}>
          <option>A4</option>
          <option>Letter</option>
          <option>A3</option>
        </select>
      </label>

      <label>{L.orientation}:
        <select value={orientation} onChange={e=>setOrientation(e.target.value as Orientation)}>
          <option value="portrait">{L.portrait}</option>
          <option value="landscape">{L.landscape}</option>
        </select>
      </label>

      <label>{L.density}:
        <select value={density} onChange={e=>setDensity(e.target.value as Density)}>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
        </select>
      </label>

      <label><input type="checkbox" checked={cutMarks} onChange={e=>setCutMarks(e.target.checked)} /> {L.cut}</label>
      <label><input type="checkbox" checked={showHeader} onChange={e=>setShowHeader(e.target.checked)} /> {L.headers}</label>
      <label>{L.title}: <input value={headerTitle} onChange={e=>setHeaderTitle(e.target.value)} placeholder="D&D Cards" style={{ width:220 }} /></label>
      <button onClick={onPrint} style={{ border:"1px solid #ccc", borderRadius:8, padding:"6px 10px" }}>{L.print}</button>
    </div>
  );
}
