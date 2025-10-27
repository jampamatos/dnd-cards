import { Link } from "react-router-dom";
import { usePacks } from "../lib/state/packs";
import { usePrefs } from "../lib/state/prefs";

export default function DockSelection() {
  const { selected, clear } = usePacks();
  const { lang } = usePrefs();
  if (selected.length === 0) return null;

  const L = lang === "pt"
    ? { items: "Itens selecionados", view: "Ver Pacote", clear: "Limpar" }
    : { items: "Selected items",     view: "View Pack",  clear: "Clear"  };

  return (
    <div
      className="no-print dock"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 6px 24px rgba(0,0,0,.12)",
        display: "flex",
        gap: 8,
        alignItems: "center",
        zIndex: 50
      }}
    >
      <span style={{ fontWeight:700 }}>
        {L.items}: {selected.length}
      </span>
      <Link to="/pack">
        <button style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc" }}>
          {L.view}
        </button>
      </Link>
      <button
        onClick={clear}
        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc" }}
      >
        {L.clear}
      </button>
    </div>
  );
}
