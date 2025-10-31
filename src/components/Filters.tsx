"use client"

import { useEffect, useId, useState } from "react"
import { usePrefs } from "../lib/state/prefs"
import { TAG_CATALOG, type TagKey } from "../lib/search/tags"
import { formatFeatureLevel, formatSpellLevel } from "../lib/format"

type Sort = "name-asc" | "level-asc" | "level-desc"

type FiltersProps = {
  q: string
  setQ: (v: string) => void
  level: number | "any"
  setLevel: (v: number | "any") => void
  levelOptions: number[]
  clazz: string | "any"
  setClazz: (v: string | "any") => void
  sort: Sort
  setSort: (v: Sort) => void
  total: number
  pageSize: number
  setPageSize: (n: number) => void
  onClearAll: () => void
  onClearLevel: () => void
  onClearClazz: () => void
  tagOptions: TagKey[]
  tags: TagKey[]
  setTags: (v: TagKey[]) => void
  onClearTags?: () => void
  kind: "spell" | "feature"
}

function FilterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  )
}

export default function Filters(p: FiltersProps) {
  const { lang } = usePrefs()
  const filtersId = useId()
  const isSpell = p.kind === "spell"
  const levelValues: Array<number | "any"> = ["any", ...p.levelOptions]
  const getDesktopMatch = () => {
    if (typeof window === "undefined") return true
    return window.matchMedia("(min-width: 769px)").matches
  }
  const [isDesktop, setIsDesktop] = useState(getDesktopMatch)
  const [filtersOpen, setFiltersOpen] = useState(getDesktopMatch)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(min-width: 769px)")
    const handle = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches)
      setFiltersOpen(event.matches)
    }
    setIsDesktop(mq.matches)
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handle)
      return () => mq.removeEventListener("change", handle)
    }
    mq.addListener(handle)
    return () => mq.removeListener(handle)
  }, [])

  const L =
    lang === "pt"
      ? {
          formLabel: "Controles de filtro",
          search: "Busca (PT/EN):",
          placeholder: "fireball, escudo, cura...",
          level: isSpell ? "Círculo:" : "Nível:",
          any: "Qualquer",
          clazz: "Classe:",
          sort: "Ordenar por:",
          nameAZ: "Nome (A→Z)",
          levelUp: "Nível (↑)",
          levelDown: "Nível (↓)",
          perPage: "Por página",
          tags: "Tags:",
          clearTags: "Limpar tags",
          clearAll: "Limpar filtros",
          results: (n: number) => (n === 1 ? "resultado" : "resultados"),
          levelChip: (n: number) => (isSpell ? formatSpellLevel(n, "pt") : formatFeatureLevel(n, "pt")),
          levelOption: (n: number) => (isSpell ? formatSpellLevel(n, "pt") : formatFeatureLevel(n, "pt")),
          classChip: (c: string) => c,
          tagTitle: "Filtrar por tag",
          showFilters: "Mostrar filtros",
          hideFilters: "Ocultar filtros",
        }
      : {
          formLabel: "Filter controls",
          search: "Search (PT/EN):",
          placeholder: "fireball, shield, healing...",
          level: "Level:",
          any: "Any",
          clazz: "Class:",
          sort: "Sort by:",
          nameAZ: "Name (A→Z)",
          levelUp: "Level (↑)",
          levelDown: "Level (↓)",
          perPage: "Per page",
          tags: "Tags:",
          clearTags: "Clear tags",
          clearAll: "Clear filters",
          results: (n: number) => (n === 1 ? "result" : "results"),
          levelChip: (n: number) => (isSpell ? formatSpellLevel(n, "en") : formatFeatureLevel(n, "en")),
          levelOption: (n: number) => (isSpell ? formatSpellLevel(n, "en") : formatFeatureLevel(n, "en")),
          classChip: (c: string) => c,
          tagTitle: "Filter by tag",
          showFilters: "Show filters",
          hideFilters: "Hide filters",
        }

  const label = (k: TagKey) => (lang === "pt" ? TAG_CATALOG[k].pt : TAG_CATALOG[k].en)

  function toggleTag(k: TagKey) {
    const has = p.tags.includes(k)
    p.setTags(has ? p.tags.filter((t) => t !== k) : [...p.tags, k])
  }

  const toggleLabel = filtersOpen ? L.hideFilters : L.showFilters
  const showButtonText = filtersOpen || !isDesktop

  return (
    <>
      <div className={`filters-toggle container ${filtersOpen ? "" : "filters-toggle--floating"}`}>
        <button
          className={`btn btn-primary filters-toggle-btn ${filtersOpen ? "" : "filters-toggle-btn--floating"}`}
          onClick={() => setFiltersOpen((prev) => !prev)}
          aria-expanded={filtersOpen}
          aria-controls={filtersId}
          aria-label={toggleLabel}
        >
          <FilterIcon />
          {showButtonText && <span>{toggleLabel}</span>}
        </button>
      </div>

      <form
        id={filtersId}
        className={`filters sticky container ${filtersOpen ? "" : "filters--hidden"}`}
        onSubmit={(event) => event.preventDefault()}
        aria-label={L.formLabel}
        aria-hidden={filtersOpen ? undefined : true}
      >
        <div className="filters-row">
          <label>
            <span>{L.search}</span>
            <input
              type="search"
              inputMode="search"
              value={p.q}
              onChange={(e) => p.setQ(e.target.value)}
              placeholder={L.placeholder}
              aria-label={L.search}
            />
          </label>
          <label>
            <span>{L.level}</span>
            <select
              value={String(p.level)}
              onChange={(e) => p.setLevel(e.target.value === "any" ? "any" : Number(e.target.value))}
              aria-label={L.level}
            >
              {levelValues.map((l) => (
                <option key={String(l)} value={String(l)}>
                  {l === "any" ? L.any : L.levelOption(l)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{L.clazz}</span>
            <select value={p.clazz} onChange={(e) => p.setClazz(e.target.value)} aria-label={L.clazz}>
              <option value="any">{L.any}</option>
              {["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Wizard", "Warlock"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            <span>{L.sort}</span>
            <select value={p.sort} onChange={(e) => p.setSort(e.target.value as Sort)} aria-label={L.sort}>
              <option value="name-asc">{L.nameAZ}</option>
              <option value="level-asc">{L.levelUp}</option>
              <option value="level-desc">{L.levelDown}</option>
            </select>
          </label>
          <label>
            <span>
              {L.perPage} ({p.total}):
            </span>
            <select
              value={String(p.pageSize)}
              onChange={(e) => p.setPageSize(Number(e.target.value))}
              aria-label={L.perPage}
            >
              {[8, 12, 16, 24, 36].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {(p.tagOptions.length > 0 || p.tags.length > 0) && (
          <div className="chips" style={{ alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ opacity: 0.8, fontWeight: 600 }}>{L.tags}</span>
            {p.tagOptions.map((k) => {
              const active = p.tags.includes(k)
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleTag(k)}
                  aria-pressed={active}
                  className={`chip ${active ? "chip--active" : "chip--click"}`}
                  title={L.tagTitle}
                >
                  #{label(k)}
                </button>
              )
            })}
            {p.tags.length > 0 && (
              <button
                type="button"
                onClick={p.onClearTags ?? (() => p.setTags([]))}
                className="btn"
                style={{ marginLeft: "auto" }}
                aria-label={L.clearTags}
              >
                {L.clearTags}
              </button>
            )}
          </div>
        )}

        <div className="chips" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <strong aria-live="polite" style={{ fontSize: "0.95rem" }}>
            {p.total} {L.results(p.total)}
          </strong>
          {p.level !== "any" && (
            <button
              type="button"
              onClick={p.onClearLevel}
              className="chip"
              aria-label={`${L.clearAll} ${L.levelChip(p.level as number)}`}
            >
              {L.levelChip(p.level as number)} ✕
            </button>
          )}
          {p.clazz !== "any" && (
            <button
              type="button"
              onClick={p.onClearClazz}
              className="chip"
              aria-label={`${L.clearAll} ${L.classChip(p.clazz)}`}
            >
              {L.classChip(p.clazz)} ✕
            </button>
          )}
          {p.tags.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleTag(k)}
              className="chip"
              aria-label={`${L.clearAll} ${label(k)}`}
            >
              #{label(k)} ✕
            </button>
          ))}
          {(p.level !== "any" || p.clazz !== "any" || p.q || p.tags.length > 0) && (
            <button
              type="button"
              onClick={p.onClearAll}
              className="btn"
              style={{ marginLeft: "auto" }}
              aria-label={L.clearAll}
            >
              {L.clearAll}
            </button>
          )}
        </div>
      </form>
    </>
  )
}
