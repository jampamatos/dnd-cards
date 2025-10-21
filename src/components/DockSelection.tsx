import { Link } from "react-router-dom";
import { usePacks } from "../lib/state/packs";

export default function DockSelection() {
    const { selected, clear } = usePacks();
    if (selected.length === 0) return null;

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
                Itens selecionados: {selected.length}
            </span>
            <Link to="/pack">
                <button style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc" }}>
                    Ver Pacote
                </button>
            </Link>
            <button
                onClick={clear}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc" }}
            >
                Limpar
            </button>
        </div>
    );
}