import { usePacks } from "../lib/state/packs";
import type { Kind } from "../lib/state/packs";
import { usePrefs } from "../lib/state/prefs";
import type { TagKey } from "../lib/search/tags";
import { TAG_CATALOG } from "../lib/search/tags";

type CardProps = {
  id: string;         kind: Kind;
  titlePt: string;    titleEn: string;
  schoolPt: string;   schoolEn: string;
  pillsPt: string[];  pillsEn: string[];
  bodyPt: string;     bodyEn: string;
  level?: number;
  classes?: string[];
  onLevelClick?: (lvl:number)=>void;
  onClassClick?: (clazz:string)=>void;

  // Optional tag chip configuration exposed to parent container
  tagKeys?: TagKey[];
  onTagClick?: (tag: TagKey)=>void;
};

function pillToTag(pill: string, lang: "pt" | "en"): TagKey | null {
  const t = pill.toLowerCase();
  // order matters
  if (t.includes(lang === "pt" ? "reação" : "reaction")) return "reaction";
  if (t.includes(lang === "pt" ? "ação bônus" : "bonus action")) return "bonus-action";
  if (t.includes(lang === "pt" ? "ação" : "action")) return "action";
  if (t.includes(lang === "pt" ? "concentração" : "concentration")) return "concentration";
  if (t.includes(lang === "pt" ? "ritual" : "ritual")) return "ritual";
  if (t.includes(lang === "pt" ? "toque" : "touch")) return "touch";
  if (t.includes(lang === "pt" ? "pessoal" : "self")) return "self";
  return null;
}

export default function Card(props: CardProps) {
  const {
    id, kind, titlePt, titleEn, schoolPt, schoolEn,
    pillsPt, pillsEn, bodyPt, bodyEn,
    level, classes, onLevelClick, onClassClick,
    tagKeys, onTagClick
  } = props;

  const { add, remove, isSelected } = usePacks();
  const { lang } = usePrefs();
  const selected = isSelected(id, kind);

  // localized text
  const pills = lang === "pt" ? pillsPt : pillsEn;
  const body  = lang === "pt" ? bodyPt  : bodyEn;

  const L = lang === "pt"
    ? {
        add: "+ Selecionar",
        remove: "✓ Selecionado",
        ttAdd: "Adicionar à Seleção",
        ttRemove: "Remover da Seleção",
        ttLevel: "Filtrar por nível",
        ttTag: "Filtrar por tag",
      }
    : {
        add: "+ Select",
        remove: "✓ Selected",
        ttAdd: "Add to Selection",
        ttRemove: "Remove from Selection",
        ttLevel: "Filter by level",
        ttTag: "Filter by tag",
      };

  const TitleBlock = () => (
    <h3 style={{ margin:0, fontWeight:700 }}>
      {lang === "pt"
        ? (<>{titlePt} <span style={{ opacity:.7 }}> / {titleEn}</span></>)
        : titleEn}
    </h3>
  );

  const SchoolBlock = () => (
    <h4 style={{ margin:0, fontWeight:500, fontSize:14 }}>
      {lang === "pt"
        ? (<>{schoolPt} <span style={{ opacity:.7 }}> / {schoolEn}</span></>)
        : schoolEn}
    </h4>
  );

  return (
    <article style={{ border:"1px solid #ddd", borderRadius:8, padding:12, breakInside:"avoid" }}>
      <header style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
        <div>
          <TitleBlock />
          <SchoolBlock />
        </div>
        <button
          onClick={() => selected ? remove(id, kind) : add({ id, kind })}
          style={{ padding:"4px 8px", borderRadius:8, border:"1px solid #ccc", background:selected?"#e6ffed":"#f6f6f6" }}
          title={selected ? L.ttRemove : L.ttAdd}
        >
          {selected ? L.remove : L.add}
        </button>
      </header>

      {/* standard pills */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, margin:"8px 0" }}>
        {pills.map((p, i) => {
          const isLevelPill = i === 0 && typeof level === "number" && !!onLevelClick;
          const mappedTag = !isLevelPill && onTagClick ? pillToTag(p, lang) : null;
          const clickable = isLevelPill || Boolean(mappedTag);

          const onClick =
            isLevelPill ? () => onLevelClick!(level!) :
            mappedTag ? () => onTagClick!(mappedTag) :
            undefined;

          return (
            <button
              key={i}
              onClick={onClick}
              style={{
                fontSize:12,
                border:"1px solid #ccc",
                borderRadius:999,
                padding:"2px 8px",
                background: clickable ? "#f6faff" : "transparent",
                cursor: clickable ? "pointer" : "default"
              }}
              title={isLevelPill ? L.ttLevel : (mappedTag ? L.ttTag : undefined)}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* classes */}
      {classes?.length ? (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, margin:"0 0 8px" }}>
          {classes.map((c) => (
            <button
              key={c}
              onClick={onClassClick ? ()=>onClassClick(c) : undefined}
              style={{ fontSize:12, border:"1px solid #ccc", borderRadius:999, padding:"2px 8px", background:"#fafafa", cursor:"pointer" }}
              title={lang === "pt" ? "Filtrar por classe" : "Filter by class"}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {/* advanced tags */}
      {tagKeys && tagKeys.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, margin:"0 0 8px" }}>
          {tagKeys.map((k) => {
            const label = lang === "pt" ? TAG_CATALOG[k].pt : TAG_CATALOG[k].en;
            return (
              <button
                key={k}
                onClick={onTagClick ? ()=>onTagClick(k) : undefined}
                style={{ fontSize:12, border:"1px solid #bbb", borderRadius:999, padding:"2px 8px", background:"#fff", cursor:"pointer" }}
                title={lang === "pt" ? "Filtrar por tag" : "Filter by tag"}
              >
                #{label}
              </button>
            );
          })}
        </div>
      )}

      <p style={{ marginTop:8 }}>{body}</p>
    </article>
  );
}
