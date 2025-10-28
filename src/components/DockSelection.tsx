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
    <div className="no-print dock">
      <span style={{ fontWeight:700 }}>
        {L.items}: {selected.length}
      </span>
      <Link to="/pack">
        <button className="btn">{L.view}</button>
      </Link>
      <button className="btn" onClick={clear}>{L.clear}</button>
    </div>
  );
}
