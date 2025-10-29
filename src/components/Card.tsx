"use client"

import { usePacks } from "../lib/state/packs"
import type { Kind } from "../lib/state/packs"
import { usePrefs } from "../lib/state/prefs"
import type { TagKey } from "../lib/search/tags"
import { TAG_CATALOG } from "../lib/search/tags"

type CardProps = {
  id: string
  kind: Kind
  titlePt: string
  titleEn: string
  schoolPt: string
  schoolEn: string
  pillsPt: string[]
  pillsEn: string[]
  bodyPt: string
  bodyEn: string
  components?: { verbal?: boolean; somatic?: boolean; material?: string }
  level?: number
  classes?: string[]
  onLevelClick?: (lvl: number) => void
  onClassClick?: (clazz: string) => void
  tagKeys?: TagKey[]
  onTagClick?: (tag: TagKey) => void
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

function pillToTag(pill: string, lang: "pt" | "en"): TagKey | null {
  const t = pill.toLowerCase()
  if (t.includes(lang === "pt" ? "reação" : "reaction")) return "reaction"
  if (t.includes(lang === "pt" ? "ação bônus" : "bonus action")) return "bonus-action"
  if (t.includes(lang === "pt" ? "ação" : "action")) return "action"
  if (t.includes(lang === "pt" ? "concentração" : "concentration")) return "concentration"
  if (t.includes(lang === "pt" ? "ritual" : "ritual")) return "ritual"
  if (t.includes(lang === "pt" ? "toque" : "touch")) return "touch"
  if (t.includes(lang === "pt" ? "pessoal" : "self")) return "self"
  return null
}

const ConcentrationIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const RitualIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
)

export default function Card(props: CardProps) {
  const {
    id,
    kind,
    titlePt,
    titleEn,
    schoolPt,
    schoolEn,
    pillsPt,
    pillsEn,
    bodyPt,
    bodyEn,
    level,
    classes,
    onLevelClick,
    onClassClick,
    tagKeys,
    onTagClick,
  } = props

  const { add, remove, isSelected } = usePacks()
  const { lang } = usePrefs()
  const selected = isSelected(id, kind)

  const pills = lang === "pt" ? pillsPt : pillsEn
  const body = lang === "pt" ? bodyPt : bodyEn

  const L =
    lang === "pt"
      ? {
          add: "+ Selecionar",
          remove: "✓ Selecionado",
          ttAdd: "Adicionar à Seleção",
          ttRemove: "Remover da Seleção",
          ttLevel: "Filtrar por nível",
          ttTag: "Filtrar por tag",
          concentration: "Concentração",
          ritual: "Ritual",
        }
      : {
          add: "+ Select",
          remove: "✓ Selected",
          ttAdd: "Add to Selection",
          ttRemove: "Remove from Selection",
          ttLevel: "Filter by level",
          ttTag: "Filter by tag",
          concentration: "Concentration",
          ritual: "Ritual",
        }

  const compItems = (() => {
    const c = props.components
    if (!c) return [] as Array<{ key: "V" | "S" | "M"; title: string; material?: string }>
    const items: Array<{ key: "V" | "S" | "M"; title: string; material?: string }> = []
    if (c.verbal) items.push({ key: "V", title: lang === "pt" ? "Componente Verbal" : "Verbal component" })
    if (c.somatic) items.push({ key: "S", title: lang === "pt" ? "Componente Somático" : "Somatic component" })
    if (c.material)
      items.push({
        key: "M",
        title: (lang === "pt" ? "Componente Material: " : "Material component: ") + c.material,
        material: c.material,
      })
    return items
  })()

  const hasConcentration = pills.some((p) => p.toLowerCase().includes(lang === "pt" ? "concentração" : "concentration"))
  const hasRitual = pills.some((p) => p.toLowerCase().includes(lang === "pt" ? "ritual" : "ritual"))

  const TitleBlock = () => (
    <h3 className="card__h3">
      {lang === "pt" ? (
        <>
          {titlePt} <span className="muted"> / {titleEn}</span>
        </>
      ) : (
        titleEn
      )}
    </h3>
  )

  const SchoolBlock = () => (
    <h4 className="card__h4">
      {lang === "pt" ? (
        <>
          {schoolPt} <span className="muted"> / {schoolEn}</span>
        </>
      ) : (
        schoolEn
      )}
    </h4>
  )

  return (
    <article className="card">
      <header className="card__head">
        <div style={{ flex: 1 }}>
          <TitleBlock />
          <SchoolBlock />
        </div>
        <button
          type="button"
          onClick={() => (selected ? remove(id, kind) : add({ id, kind }))}
          className={`btn ${selected ? "btn-primary" : ""}`}
          title={selected ? L.ttRemove : L.ttAdd}
          aria-pressed={selected}
          aria-label={selected ? L.ttRemove : L.ttAdd}
        >
          {selected ? L.remove : L.add}
        </button>
      </header>

      {(hasConcentration || hasRitual) && (
        <div className="chips" style={{ margin: "8px 0" }}>
          {hasConcentration && (
            <span className="chip chip--concentration" title={L.concentration} aria-label={L.concentration}>
              <ConcentrationIcon />
              {L.concentration}
            </span>
          )}
          {hasRitual && (
            <span className="chip chip--ritual" title={L.ritual} aria-label={L.ritual}>
              <RitualIcon />
              {L.ritual}
            </span>
          )}
        </div>
      )}

      {compItems.length > 0 && (
        <div className="chips" style={{ margin: "0 0 8px" }}>
          <span
            className="chip chip--components"
            title={lang === "pt" ? "Componentes da magia" : "Spell components"}
            aria-label={lang === "pt" ? "Componentes da magia" : "Spell components"}
          >
            {compItems.map((it) => {
              const isMaterial = it.key === "M"
              const label = isMaterial ? (it.material ?? "M") : it.key

              return (
                <span
                  key={it.key}
                  className={`chip chip--component ${isMaterial ? "chip--component-m" : ""}`}
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

      <div className="chips" style={{ margin: "8px 0" }}>
        {pills.map((p, i) => {
          const isConcentration = p.toLowerCase().includes(lang === "pt" ? "concentração" : "concentration")
          const isRitual = p.toLowerCase().includes(lang === "pt" ? "ritual" : "ritual")
          if (isConcentration || isRitual) return null

          const isLevelPill = i === 0 && typeof level === "number"
          const hasLevelClick = isLevelPill && !!onLevelClick
          const mappedTag = !isLevelPill && onTagClick ? pillToTag(p, lang) : null
          const clickable = hasLevelClick || Boolean(mappedTag)
          const classes = ["chip"]
          if (clickable) classes.push("chip--click")
          if (isLevelPill) classes.push("chip--level")
          const className = classes.join(" ")
          const onClick = hasLevelClick
            ? () => onLevelClick!(level!)
            : mappedTag
              ? () => onTagClick!(mappedTag)
              : undefined
          if (clickable) {
            return (
              <button
                type="button"
                key={i}
                onClick={onClick}
                className={className}
                title={isLevelPill ? L.ttLevel : L.ttTag}
              >
                {p}
              </button>
            )
          }
          return (
            <span key={i} className={className}>
              {p}
            </span>
          )
        })}
      </div>

      {classes?.length ? (
        <div className="chips" style={{ margin: "0 0 8px" }}>
          {classes.map((c) =>
            onClassClick ? (
              <button
                type="button"
                key={c}
                onClick={() => onClassClick(c)}
                className="chip chip--click"
                title={lang === "pt" ? "Filtrar por classe" : "Filter by class"}
              >
                {c}
              </button>
            ) : (
              <span key={c} className="chip">
                {c}
              </span>
            ),
          )}
        </div>
      ) : null}

      {tagKeys && tagKeys.length > 0 && (
        <div className="chips" style={{ margin: "0 0 8px" }}>
          {tagKeys.map((k) => {
            const label = lang === "pt" ? TAG_CATALOG[k].pt : TAG_CATALOG[k].en
            return onTagClick ? (
              <button
                type="button"
                key={k}
                onClick={() => onTagClick(k)}
                className="chip chip--click"
                title={lang === "pt" ? "Filtrar por tag" : "Filter by tag"}
              >
                #{label}
              </button>
            ) : (
              <span key={k} className="chip">
                #{label}
              </span>
            )
          })}
        </div>
      )}

      <div className="body" style={{ marginTop: 8 }}>
        {renderRichBody(body)}
      </div>
    </article>
  )
}
