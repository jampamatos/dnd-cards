import { usePrefs } from "../lib/state/prefs";

export default function Home() {
  const { lang } = usePrefs();
  return (
    <div>
      <h1>D&D Cards</h1>
      <p>
        {lang === "pt"
          ? "Catálogo de magias, características e wild shapes. Selecione e gere impressão."
          : "Catalog of spells, features, and wild shapes. Select and generate print."}
      </p>
    </div>
  );
}
