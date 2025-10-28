type CardPrintProps = {
  titlePt: string;    titleEn: string;
  schoolPt: string;   schoolEn: string;
  pillsPt: string[];  pillsEn: string[];
  bodyPt: string;     bodyEn: string;
  components?: { verbal?: boolean; somatic?: boolean; material?: string };
  withCutMarks?: boolean;
  lang: "pt" | "en";
};

function escapeHtml(s: string): string {
  return s
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/"/g, "&quot;")
    .replaceAll(/'/g, "&#039;");
}
function inlineMarkdownToHtml(s: string): string {
  let h = escapeHtml(s);
  h = h.replace(/(\*\*|__)(.+?)\1/g, "<strong>$2</strong>");
  h = h.replace(/(\*|_)(.+?)\1/g, "<em>$2</em>");
  h = h.replace(/\n/g, "<br/>");
  return h;
}
function renderRichBody(body: string) {
  const paragraphs = body.split(/\n\s*\n/);
  return paragraphs.map((p, i) => (
    <p key={i} dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(p) }} />
  ));
}

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

      <div className="body">{renderRichBody(body)}</div>
    </article>
  );
}
