type CardPrintProps = {
  titlePt: string;    titleEn: string;
  schoolPt: string;   schoolEn: string;
  pillsPt: string[];  pillsEn: string[];
  bodyPt: string;     bodyEn: string;
  withCutMarks?: boolean;
  lang: "pt" | "en";
};

export default function CardPrint(p: CardPrintProps) {
  const pills = p.lang === "pt" ? p.pillsPt : p.pillsEn;
  const body  = p.lang === "pt" ? p.bodyPt : p.bodyEn;

  return (
    <article className={`print-card ${p.withCutMarks ? "cutmarks" : ""}`}>
      <h3 style={{ marginTop:0 }}>
        {p.titlePt} <span style={{ opacity:.7 }}> / {p.titleEn}</span><br/>
        <small style={{ fontWeight:500, fontSize:14 }}>{p.schoolPt} <span style={{ opacity:.7 }}> / {p.schoolEn}</span></small>
      </h3>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, margin:"6px 0 8px" }}>
        {pills.map((p, i) => (
          <span key={i} style={{ fontSize: "0.85em", border:"1px solid #ccc", borderRadius: 999, padding:"1px 6px" }}>{p}</span>
        ))}
      </div>
      <div style={{ fontSize:"0.95em", lineHeight:1.25 }}>{body}</div>
    </article>
  );
}
