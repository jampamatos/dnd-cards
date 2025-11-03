"use client"

import { usePacks } from "../lib/state/packs"
import type { Kind } from "../lib/state/packs"
import { usePrefs } from "../lib/state/prefs"
import { formatClassName } from "../lib/format"
import type { PillKind, PillValue } from "../lib/pills"
import type { TagKey } from "../lib/search/tags"
import { TAG_CATALOG } from "../lib/search/tags"

type CardProps = {
  id: string
  kind: Kind
  titlePt: string
  titleEn: string
  schoolPt: string
  schoolEn: string
  pillsPt: PillValue[]
  pillsEn: PillValue[]
  bodyPt: string
  bodyEn: string
  components?: { verbal?: boolean; somatic?: boolean; material?: { pt: string; en: string } }
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
  if (t.includes(lang === "pt" ? "reação" : "reaction")) return "reaction" as TagKey
  if (t.includes(lang === "pt" ? "ação bônus" : "bonus action")) return "bonus-action" as TagKey
  if (t.includes(lang === "pt" ? "ação" : "action")) return "action" as TagKey
  if (t.includes(lang === "pt" ? "concentração" : "concentration")) return "concentration" as TagKey
  if (t.includes(lang === "pt" ? "ritual" : "ritual")) return "ritual" as TagKey
  if (t.includes(lang === "pt" ? "toque" : "touch")) return "touch" as TagKey
  if (t.includes(lang === "pt" ? "pessoal" : "self")) return "self" as TagKey
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

const CastingIcon = () => (
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
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

const DurationIcon = () => (
  <svg
    width="14"
    height="14"
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

  const rawPills = lang === "pt" ? pillsPt : pillsEn
  const body = lang === "pt" ? bodyPt : bodyEn
  const normalizedPills = rawPills.map((pill, index) => {
    if (typeof pill === "string") {
      const kind: PillKind = index === 0 && typeof level === "number" ? "level" : "default";
      return { label: pill, kind };
    }
    const kind: PillKind =
      pill.kind ?? (index === 0 && typeof level === "number" ? "level" : "default");
    return { label: pill.label, kind };
  });

  const pillHints: Partial<Record<PillKind, string>> = lang === "pt"
    ? { casting: "Tempo de Conjuração", duration: "Duração", range: "Alcance" }
    : { casting: "Casting Time", duration: "Duration", range: "Range" };

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
    if (c.material) {
      const materialText = lang === "pt" ? c.material.pt : c.material.en
      items.push({
        key: "M",
        title: (lang === "pt" ? "Componente Material: " : "Material component: ") + materialText,
        material: materialText,
      })
    }
    return items
  })()

  const hasConcentration = normalizedPills.some((p) =>
    p.label.toLowerCase().includes(lang === "pt" ? "concentração" : "concentration"),
  )
  const hasRitual = normalizedPills.some((p) => p.label.toLowerCase().includes(lang === "pt" ? "ritual" : "ritual"))

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
              if (isMaterial) {
                return (
                  <span
                    key={it.key}
                    className="chip chip--component chip--component-m"
                    title={it.title}
                    aria-label={it.title}
                  >
                    <span className="chip--component-badge">M</span>
                    <span className="chip--component-text">{it.material}</span>
                  </span>
                )
              }

              return (
                <span key={it.key} className="chip chip--component" title={it.title} aria-label={it.title}>
                  {it.key}
                </span>
              )
            })}
          </span>
        </div>
      )}

      <div className="chips" style={{ margin: "8px 0" }}>
        {normalizedPills.map((pill, i) => {
          const label = pill.label
          const lower = label.toLowerCase()
          const isConcentration = lower.includes(lang === "pt" ? "concentração" : "concentration")
          const isRitual = lower.includes(lang === "pt" ? "ritual" : "ritual")
          if (isConcentration || isRitual) return null

          const isLevelPill = pill.kind === "level" && typeof level === "number"
          const hasLevelClick = isLevelPill && !!onLevelClick
          const canMapTag = pill.kind !== "casting"
          const mappedTag = !isLevelPill && canMapTag && onTagClick ? pillToTag(label, lang) : null
          const clickable = hasLevelClick || Boolean(mappedTag)
          const classes = ["chip"]
          if (clickable) classes.push("chip--click")
          if (isLevelPill) classes.push("chip--level")
          if (pill.kind === "casting") classes.push("chip--casting")
          if (pill.kind === "duration") classes.push("chip--duration")
          const className = classes.join(" ")
          const icon = pill.kind === "casting" ? <CastingIcon /> : pill.kind === "duration" ? <DurationIcon /> : null
          const content = (
            <>
              {icon}
              <span>{label}</span>
            </>
          )
          const baseHint = pill.kind ? pillHints[pill.kind] : undefined
          const onClick = hasLevelClick
            ? () => onLevelClick!(level!)
            : mappedTag
              ? () => onTagClick!(mappedTag)
              : undefined
          const title = hasLevelClick ? L.ttLevel : mappedTag ? L.ttTag : baseHint
          if (clickable) {
            return (
              <button
                type="button"
                key={i}
                onClick={onClick}
                className={className}
                title={title}
                aria-label={title}
              >
                {content}
              </button>
            )
          }
          return (
            <span key={i} className={className} title={baseHint} aria-label={baseHint}>
              {content}
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
                {formatClassName(c, lang)}
              </button>
            ) : (
              <span key={c} className="chip">
                {formatClassName(c, lang)}
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
