import { usePrefs } from "../lib/state/prefs";

export default function Home() {
  const { lang } = usePrefs();
  return (
    <div>
      <h1>D&D Cards</h1>
      <p>
        {lang === "pt"
          ? "Catálogo de magias, características e wild shapes para D&D 5e (2024). Selecione e gere impressão."
          : "Catalog of spells, features, and wild shapes for D&D 5e (2024). Select and generate print."}
      </p>
      <br />
      <p>
        {lang === "pt"
          ? 'Dúvidas? Sugestões? Ideias? Um "boa, garoto!"? Manda um'
          : "Doubts? Suggestions? Ideas? An 'attaboy!'? Send me an"} <a href="mailto:jp.coutm@gmail.com">email.</a>
      </p>
    </div>
  );
}
