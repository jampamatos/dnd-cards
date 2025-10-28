type CardPrintProps = {
  titlePt: string;    titleEn: string;
  schoolPt: string;   schoolEn: string;
  pillsPt: string[];  pillsEn: string[];
  bodyPt: string;     bodyEn: string;
  components?: { verbal?: boolean; somatic?: boolean; material?: string };
  withCutMarks?: boolean;
  lang: "pt" | "en";
};

export default function CardPrint(p: CardPrintProps) {
  const pills = p.lang === "pt" ? p.pillsPt : p.pillsEn;
  const body  = p.lang === "pt" ? p.bodyPt : p.bodyEn;

  // Derive V/S/M list for print
  const compItems = (() => {
    const c = p.components;
    if (!c) return [] as Array<{ key: 'V'|'S'|'M'; title: string; material?: string }>;
    const items: Array<{ key: 'V'|'S'|'M'; title: string; material?: string }> = [];
    if (c.verbal)  items.push({ key: 'V', title: p.lang === 'pt' ? 'Componente Verbal'   : 'Verbal component' });
    if (c.somatic) items.push({ key: 'S', title: p.lang === 'pt' ? 'Componente Somático' : 'Somatic component' });
    if (c.material) items.push({
      key: 'M',
      title: (p.lang === 'pt' ? 'Componente Material: ' : 'Material component: ') + c.material,
      material: c.material,
    });
    return items;
  })();

  return (
    <article className={`print-card ${p.withCutMarks ? "cutmarks" : ""}`} lang={p.lang}>
      <h3>
        <span className="title-pt">{p.titlePt}</span>
        {" / "}
        <span className="title-en">{p.titleEn}</span>
        <small>
          {p.lang === "pt" ? p.schoolPt : p.schoolEn}
        </small>
      </h3>

      <div className="pills">
        {pills.map((tag, i) => (
          <span key={i} className="pill">{tag}</span>
        ))}
      </div>

      {compItems.length > 0 && (
        <div className="pills">
          <span
            className="pill pill--components"
            title={p.lang === "pt" ? "Componentes da magia" : "Spell components"}
            aria-label={p.lang === "pt" ? "Componentes da magia" : "Spell components"}
          >
            {compItems.map((it) => {
              const isMaterial = it.key === "M";
              const label = isMaterial ? (it.material ?? "M") : it.key;
              return (
                <span
                  key={it.key}
                  className={`pill pill--component ${isMaterial ? "pill--component-m" : ""}`}
                  title={it.title}
                  aria-label={it.title}
                >
                  {label}
                </span>
              );
            })}
          </span>
        </div>
      )}

      <div className="body">{body}</div>
    </article>
  );
}
