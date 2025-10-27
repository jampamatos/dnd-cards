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
    <article className={`print-card ${p.withCutMarks ? "cutmarks" : ""}`} lang={p.lang}>
      <h3>
        {p.lang === "pt"
          ? (<>{p.titlePt} <span style={{ opacity:.7 }}> / {p.titleEn}</span></>)
          : p.titleEn}
        <br />
        <small style={{ fontWeight:500, fontSize:14 }}>
          {p.lang === "pt"
            ? (<>{p.schoolPt} <span style={{ opacity:.7 }}> / {p.schoolEn}</span></>)
            : p.schoolEn}
        </small>
      </h3>

      <div className="pills">
        {pills.map((tag, i) => (
          <span key={i} className="pill">{tag}</span>
        ))}
      </div>

      <div className="body">{body}</div>
    </article>
  );
}
