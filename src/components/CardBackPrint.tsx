type Props = {
  titlePt: string; titleEn: string;
  withCutMarks?: boolean;
  lang: "pt" | "en";
};

export default function CardBackPrint({ titlePt, titleEn, withCutMarks, lang }: Props) {
  const title = lang === "pt" ? titlePt : titleEn;
  return (
    <article className={`print-card ${withCutMarks ? "cutmarks" : ""}`} lang={lang}>
      <div style={{
        height:"100%", display:"grid", placeItems:"center",
        textAlign:"center", padding:"12px"
      }}>
        <h3 style={{ margin:0, lineHeight:1.1 }}>{title}</h3>
      </div>
    </article>
  );
}
