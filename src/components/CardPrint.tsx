type CardPrintProps = {
  titlePt: string;
  titleEn: string;
  schoolPt: string;
  schoolEn: string;
  pills: string[];
  bodyPt: string;
  withCutMarks?: boolean;
};

export default function CardPrint({
  titlePt, titleEn, schoolPt, schoolEn, pills, bodyPt, withCutMarks = false
}: CardPrintProps) {
  return (
    <article className={`print-card ${withCutMarks ? "cutmarks" : ""}`}>
      <h3 style={{ marginTop:0 }}>
        {titlePt} <span style={{ opacity:.7 }}> / {titleEn}</span><br/>
        <small style={{ fontWeight:500, fontSize:14 }}>{schoolPt} <span style={{ opacity:.7 }}> / {schoolEn}</span></small>
      </h3>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, margin:"6px 0 8px" }}>
        {pills.map((p, i) => (
          <span key={i} style={{ fontSize: "0.85em", border:"1px solid #ccc", borderRadius: 999, padding:"1px 6px" }}>{p}</span>
        ))}
      </div>
      <div style={{ fontSize:"0.95em", lineHeight:1.25 }}>{bodyPt}</div>
    </article>
  );
}
