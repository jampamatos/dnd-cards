import { useEffect, useState } from "react";
import { SpellsArray } from "../lib/schema/spell";
import type { TSpell } from "../lib/schema/spell";
import Card from "../components/Card";

export default function Browse() {
    const [spells, setSpells] = useState<TSpell[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        import("../data/srd/spells.json")
          .then((m) => {
            const parsed = SpellsArray.safeParse(m.default);
            if (!parsed.success) {
                setError("Error loading spells data.");
                console.error(parsed.error.format());
            } else {
                setSpells(parsed.data);
            }
          })
    }, []);

    if (error) return <p style={{ color:"crimson" }}>{error}</p>;

    return (
        <div>
            <h2> Magias</h2>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
            }}>
                {spells.map(sp => (
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
        </div>
    );
}