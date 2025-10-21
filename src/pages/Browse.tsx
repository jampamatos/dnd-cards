import { useEffect, useMemo, useState } from "react";
import { SpellsArray } from "../lib/schema/spell";
import { buildIndex, toDocs } from "../lib/search/indexer";
import type { TSpell } from "../lib/schema/spell";
import Card from "../components/Card";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";

export default function Browse() {
    const [spells, setSpells] = useState<TSpell[]>([]);
    const [error, setError] = useState<string | null>(null);

    // filters and controls
    const [q, setQ] = useState("");
    const [level, setLevel] = useState<number | "any">("any");
    const [clazz, setClazz] = useState<string | "any">("any");
    const [pageSize, setPageSize] = useState(12);
    const [page, setPage] = useState(1);

    useEffect(() => {
        import("../data/srd/spells.json")
          .then((m) => setSpells(SpellsArray.parse(m.default)))
          .catch((e) => setError(String(e)));
    }, []);

    // search index
    const mini = useMemo(() => {
        if (!spells.length) return null;
        return buildIndex(toDocs(spells));
    }, [spells]);

    // filtered results
    const filtered = useMemo(() => {
        if (!mini) return [];
        let ids: string[] | null = null;

        if (q.trim()) {
            const res = mini.search(q.trim());
            ids = res.map(r=>r.id);
        }

        let arr = (ids ? spells.filter(s => ids!.includes(s.id)) : spells);

        if (level !== "any") arr = arr.filter(s => s.level === level);
        if (clazz !== "any") arr = arr.filter(s => s.classes.includes(clazz));

        return arr.sort((a,b) => (a.level - b.level) || a.name.pt.localeCompare(b.name.pt));
    }, [mini, spells, q, level, clazz]);

    // pagination
    const start = (page-1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    // reset page when filter changes
    useEffect(() => { setPage(1); }, [q, level, clazz, pageSize]);

    if (error) return <p style={{ color:"crimson" }}>Erro carregando dados: {error}</p>;

    return (
        <div>
            <h2>Navegar - Magias</h2>

            <Filters
                q={q} setQ={setQ}
                level={level} setLevel={setLevel}
                clazz={clazz} setClazz={setClazz}
                total={filtered.length}
                pageSize={pageSize} setPageSize={setPageSize}
            />

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
            }}>
                {pageItems.map(sp => (
                    <Card
                        key={sp.id}
                        id={sp.id}
                        kind="spell"
                        titlePt={sp.name.pt}
                        titleEn={sp.name.en}
                        schoolPt={sp.school.pt}
                        schoolEn={sp.school.en}
                        pills={[
                            `Nível ${sp.level}`,
                            sp.castingTime.pt,
                            sp.range.pt,
                            sp.duration.pt,
                            sp.ritual ? "Ritual" : "",
                            sp.concentration ? "Concentração" : "",
                        ].filter(Boolean)}
                        bodyPt={sp.text.pt}
                        bodyEn={sp.text.en}
                    />
                ))}
            </div>

            <Pagination page={page} setPage={setPage} total={filtered.length} pageSize={pageSize} />
        </div>
    );
}