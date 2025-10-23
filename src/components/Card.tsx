import { usePacks } from "../lib/state/packs";
import type { Kind } from "../lib/state/packs";
import { usePrefs } from "../lib/state/prefs";

type CardProps = {
    id: string;         kind: Kind;
    titlePt: string;    titleEn: string;
    schoolPt: string;   schoolEn: string;
    pillsPt: string[];  pillsEn: string[]        // i.e. ["Level 1", "Action", "Touch", "Instantaneous"]
    bodyPt: string;     bodyEn: string;
};

export default function Card(props: CardProps) {
    const { id, kind, titlePt, titleEn, schoolPt, schoolEn, pillsPt, pillsEn, bodyPt, bodyEn } = props;
    const { add, remove, isSelected } = usePacks();
    const { lang } = usePrefs();
    const selected = isSelected(id, kind);

    const pills = lang === "pt" ? pillsPt : pillsEn;
    const body = lang === "pt" ? bodyPt : bodyEn;

    return (
        <article style={{ border:"1px solid #ddd", borderRadius:8, padding:12, breakInside:"avoid" }}>
            <header style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                <div>
                    <h3 style={{ margin:0, fontWeight:700 }}>
                        {titlePt} <span style={{ opacity:.7 }}> / {titleEn}</span>
                    </h3>
                    <h4 style={{ margin:0, fontWeight:500, fontSize:14 }}>{schoolPt} <span style={{ opacity:.7 }}> / {schoolEn}</span></h4>
                </div>                
                <button
                    onClick={() => selected ? remove(id, kind) : add({ id, kind })}
                    style={{
                        padding: "4px 8px",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        background: selected ? "#e6ffed" : "#f6f6f6"
                    }}
                    title={selected ? "Remover da Seleção" : "Adicionar à Seleção"}
                >
                    {selected ? "✓ Selecionado" : "+ Selecionar"}
                </button>
            </header>
            
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, margin:"8px 0" }}>
                {pills.map((p, i) => (
                    <span key={i} style={{ fontSize:12, border:"1px solid #ccc", borderRadius:999, padding:"2px 8px" }}>
                        {p}
                    </span>
                ))}
            </div>
            <p style={{ marginTop:8 }}>{body}</p>
        </article>
    );
}