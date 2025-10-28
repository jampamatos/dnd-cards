import { usePrefs } from "../lib/state/prefs";
import type { PageFormat, Orientation, Density } from "../lib/print/layout";

type Props = {
  format: PageFormat; setFormat: (v: PageFormat) => void;
  orientation: Orientation; setOrientation: (v: Orientation) => void;
  density: Density; setDensity: (v: Density) => void;

  cutMarks: boolean; setCutMarks: (v: boolean) => void;
  showHeader: boolean; setShowHeader: (v: boolean) => void;
  headerTitle: string; setHeaderTitle: (v: string) => void;

  // novos (builder)
  reorderMode: boolean; setReorderMode: (v: boolean) => void;
  colsOverride: 0 | 1 | 2; setColsOverride: (v: 0 | 1 | 2) => void;
  backsEnabled: boolean; setBacksEnabled: (v: boolean) => void;
  backsMirrorCols: boolean; setBacksMirrorCols: (v: boolean) => void;

  onPrint: () => void;
};

export default function PrintToolbar(p: Props) {
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
        builder: "Montador",
        reorder: "Reordenar",
        columns: "Colunas",
        auto: "Auto",
        one: "1",
        two: "2",
        backs: "Verso",
        enableBacks: "Gerar páginas de verso",
        mirrorCols: "Espelhar colunas (duplex longa)",
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
        builder: "Builder",
        reorder: "Reorder",
        columns: "Columns",
        auto: "Auto",
        one: "1",
        two: "2",
        backs: "Back side",
        enableBacks: "Generate back pages",
        mirrorCols: "Mirror columns (long-edge duplex)",
      };

  return (
    <div className="no-print print-toolbar container">
      <label className="print-toolbar__control">
        <span>{L.format}</span>
        <select value={p.format} onChange={(e) => p.setFormat(e.target.value as PageFormat)}>
          <option>A4</option>
          <option>Letter</option>
          <option>A3</option>
        </select>
      </label>

      <label className="print-toolbar__control">
        <span>{L.orientation}</span>
        <select value={p.orientation} onChange={(e) => p.setOrientation(e.target.value as Orientation)}>
          <option value="portrait">{L.portrait}</option>
          <option value="landscape">{L.landscape}</option>
        </select>
      </label>

      <label className="print-toolbar__control">
        <span>{L.density}</span>
        <select value={p.density} onChange={(e) => p.setDensity(e.target.value as Density)}>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
        </select>
      </label>

      <label className="print-toolbar__check">
        <input type="checkbox" checked={p.cutMarks} onChange={(e) => p.setCutMarks(e.target.checked)} />
        <span>{L.cut}</span>
      </label>
      <label className="print-toolbar__check">
        <input type="checkbox" checked={p.showHeader} onChange={(e) => p.setShowHeader(e.target.checked)} />
        <span>{L.headers}</span>
      </label>
      <label className="print-toolbar__control">
        <span>{L.title}</span>
        <input
          value={p.headerTitle}
          onChange={(e) => p.setHeaderTitle(e.target.value)}
          placeholder="D&D Cards"
          className="print-toolbar__input"
        />
      </label>

      <span className="print-toolbar__divider" aria-hidden="true" />

      <strong className="print-toolbar__legend">{L.builder}:</strong>
      <label className="print-toolbar__check">
        <input type="checkbox" checked={p.reorderMode} onChange={(e) => p.setReorderMode(e.target.checked)} />
        <span>{L.reorder}</span>
      </label>

      <label className="print-toolbar__control">
        <span>{L.columns}</span>
        <select
          value={String(p.colsOverride)}
          onChange={(e) => p.setColsOverride(Number(e.target.value) as 0 | 1 | 2)}
          title="Auto/1/2"
        >
          <option value="0">{L.auto}</option>
          <option value="1">{L.one}</option>
          <option value="2">{L.two}</option>
        </select>
      </label>

      <label className="print-toolbar__check">
        <input type="checkbox" checked={p.backsEnabled} onChange={(e) => p.setBacksEnabled(e.target.checked)} />
        <span>{L.enableBacks}</span>
      </label>
      <label className="print-toolbar__check">
        <input
          type="checkbox"
          checked={p.backsMirrorCols}
          onChange={(e) => p.setBacksMirrorCols(e.target.checked)}
          disabled={!p.backsEnabled}
        />
        <span>{L.mirrorCols}</span>
      </label>

      <button type="button" onClick={p.onPrint} className="btn">
        {L.print}
      </button>
    </div>
  );
}
