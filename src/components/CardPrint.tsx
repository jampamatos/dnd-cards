import type { PillKind, PillValue } from "../lib/pills"

type CardPrintProps = {
  titlePt: string
  titleEn: string
  schoolPt: string
  schoolEn: string
  pillsPt: PillValue[]
  pillsEn: PillValue[]
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

const CastingIconPrint = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

const DurationIconPrint = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 2h12" />
    <path d="M6 22h12" />
    <path d="M8 2c0 4 8 4 8 8s-8 4-8 8" />
    <path d="M16 2c0 4-8 4-8 8s8 4 8 8" />
  </svg>
)

export default function CardPrint(p: CardPrintProps) {
  const rawPills = p.lang === "pt" ? p.pillsPt : p.pillsEn
  const normalizedPills = rawPills.map((pill, index) => {
    if (typeof pill === "string") {
      const kind: PillKind = index === 0 ? "level" : "default"
      return { label: pill, kind }
    }
    const kind: PillKind = pill.kind ?? (index === 0 ? "level" : "default")
    return { label: pill.label, kind }
  })
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

  const hasConcentration = normalizedPills.some((pill) =>
    pill.label.toLowerCase().includes(p.lang === "pt" ? "concentração" : "concentration"),
  )
  const hasRitual = normalizedPills.some((pill) =>
    pill.label.toLowerCase().includes(p.lang === "pt" ? "ritual" : "ritual"),
  )

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
        {normalizedPills.map((pill, i) => {
          const lower = pill.label.toLowerCase()
          const isConcentration = lower.includes(p.lang === "pt" ? "concentração" : "concentration")
          const isRitual = lower.includes(p.lang === "pt" ? "ritual" : "ritual")
          if (isConcentration || isRitual) return null

          const classes = ["pill"]
          if (pill.kind === "level" && i === 0) classes.push("pill--level")
          if (pill.kind === "casting") classes.push("pill--casting")
          if (pill.kind === "duration") classes.push("pill--duration")
          const icon = pill.kind === "casting"
            ? <CastingIconPrint />
            : pill.kind === "duration"
              ? <DurationIconPrint />
              : null

          return (
            <span key={i} className={classes.join(" ")}>
              {icon}
              <span>{pill.label}</span>
            </span>
          )
        })}
      </div>

      <div className="body">{renderRichBody(body)}</div>
    </article>
  )
}
