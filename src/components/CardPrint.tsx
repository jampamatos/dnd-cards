type CardPrintProps = {
  titlePt: string
  titleEn: string
  schoolPt: string
  schoolEn: string
  pillsPt: string[]
  pillsEn: string[]
  bodyPt: string
  bodyEn: string
  components?: { verbal?: boolean; somatic?: boolean; material?: { pt: string; en: string } }
  withCutMarks?: boolean
  lang: "pt" | "en"
}

function escapeHtml(s: string): string {
  return s
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/"/g, "&quot;")
    .replaceAll(/'/g, "&#039;")
}
function inlineMarkdownToHtml(s: string): string {
  let h = escapeHtml(s)
  h = h.replace(/(\*\*|__)(.+?)\1/g, "<strong>$2</strong>")
  h = h.replace(/(\*|_)(.+?)\1/g, "<em>$2</em>")
  h = h.replace(/\n/g, "<br/>")
  return h
}
function renderRichBody(body: string) {
  const paragraphs = body.split(/\n\s*\n/)
  return paragraphs.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(p) }} />)
}

const ConcentrationIconPrint = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const RitualIconPrint = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
)

export default function CardPrint(p: CardPrintProps) {
  const pills = p.lang === "pt" ? p.pillsPt : p.pillsEn
  const body = p.lang === "pt" ? p.bodyPt : p.bodyEn

  // Derive V/S/M list for print
  const compItems = (() => {
    const c = p.components
    if (!c) return [] as Array<{ key: "V" | "S" | "M"; title: string; material?: string }>
    const items: Array<{ key: "V" | "S" | "M"; title: string; material?: string }> = []
    if (c.verbal) items.push({ key: "V", title: p.lang === "pt" ? "Componente Verbal" : "Verbal component" })
    if (c.somatic) items.push({ key: "S", title: p.lang === "pt" ? "Componente Somático" : "Somatic component" })
    if (c.material) {
      const materialText = p.lang === "pt" ? c.material.pt : c.material.en
      items.push({
        key: "M",
        title: (p.lang === "pt" ? "Componente Material: " : "Material component: ") + materialText,
        material: materialText,
      })
    }
    return items
  })()

  const hasConcentration = pills.some((pill) =>
    pill.toLowerCase().includes(p.lang === "pt" ? "concentração" : "concentration"),
  )
  const hasRitual = pills.some((pill) => pill.toLowerCase().includes(p.lang === "pt" ? "ritual" : "ritual"))

  const L =
    p.lang === "pt"
      ? { concentration: "Concentração", ritual: "Ritual" }
      : { concentration: "Concentration", ritual: "Ritual" }

  return (
    <article className={`print-card ${p.withCutMarks ? "cutmarks" : ""}`} lang={p.lang}>
      <h3>
        <span className="card-title">
          <span className="title-pt">{p.titlePt}</span>
          {" / "}
          <span className="title-en">{p.titleEn}</span>
        </span>
        <small className="card-school">{p.lang === "pt" ? p.schoolPt : p.schoolEn}</small>
      </h3>

      {(hasConcentration || hasRitual) && (
        <div className="pills pills--special" style={{ marginBottom: 4 }}>
          {hasConcentration && (
            <span className="pill pill--concentration" title={L.concentration} aria-label={L.concentration}>
              <ConcentrationIconPrint />
              <span>{L.concentration}</span>
            </span>
          )}
          {hasRitual && (
            <span className="pill pill--ritual" title={L.ritual} aria-label={L.ritual}>
              <RitualIconPrint />
              <span>{L.ritual}</span>
            </span>
          )}
        </div>
      )}

      {compItems.length > 0 && (
        <div className="pills" style={{ marginBottom: 4 }}>
          <span
            className="pill pill--components"
            title={p.lang === "pt" ? "Componentes da magia" : "Spell components"}
            aria-label={p.lang === "pt" ? "Componentes da magia" : "Spell components"}
          >
            {compItems.map((it) => {
              const isMaterial = it.key === "M"
              const label = isMaterial ? (it.material ?? "M") : it.key
              return (
                <span
                  key={it.key}
                  className={`pill pill--component ${isMaterial ? "pill--component-m" : ""}`}
                  title={it.title}
                  aria-label={it.title}
                >
                  {label}
                </span>
              )
            })}
          </span>
        </div>
      )}

      <div className="pills">
        {pills.map((tag, i) => {
          const isConcentration = tag.toLowerCase().includes(p.lang === "pt" ? "concentração" : "concentration")
          const isRitual = tag.toLowerCase().includes(p.lang === "pt" ? "ritual" : "ritual")
          if (isConcentration || isRitual) return null

          const levelClass = i === 0 ? " pill--level" : ""

          return (
            <span key={i} className={`pill${levelClass}`}>
              {tag}
            </span>
          )
        })}
      </div>

      <div className="body">{renderRichBody(body)}</div>
    </article>
  )
}
