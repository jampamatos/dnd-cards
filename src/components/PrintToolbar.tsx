import type { PageFormat, Orientation, Density } from "../lib/print/layout";

type Props = {
    format: PageFormat; setFormat: (v: PageFormat) => void;
    orientation: Orientation; setOrientation: (v: Orientation) => void;
    density: Density; setDensity: (v: Density) => void;
    cutMarks: boolean; setCutMarks: (v: boolean) => void;
    onPrint: () => void;
};

export default function PrintToolbar({
    format, setFormat,
    orientation, setOrientation,
    density, setDensity,
    cutMarks, setCutMarks,
    onPrint
}: Props) {
    return (
        <div className="no-print" style={{ display:"flex", gap:12, alignItems:"center", padding:"8px 0", flexWrap:"wrap" }}>
          <label>Formato:
            <select value={format} onChange={e=>setFormat(e.target.value as PageFormat)}>
              <option>A4</option>
              <option>Letter</option>
              <option>A3</option>
            </select>
          </label>
          <label>Orientação:
            <select value={orientation} onChange={e=>setOrientation(e.target.value as Orientation)}>
              <option value="portrait">Retrato</option>
              <option value="landscape">Paisagem</option>
            </select>
          </label>
          <label>Densidade:
            <select value={density} onChange={e=>setDensity(e.target.value as Density)}>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
          </label>
          <label><input type="checkbox" checked={cutMarks} onChange={e=>setCutMarks(e.target.checked)} /> Linhas de corte</label>
          <button onClick={onPrint} style={{ border:"1px solid #ccc", borderRadius:8, padding:"6px 10px" }}>Imprimir / PDF</button>
        </div>
    )
}