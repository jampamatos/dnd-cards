import { usePrefs } from "../lib/state/prefs";

export default function Search() {
  const { lang } = usePrefs();
  return (
    <section className="page container">
      <h1>{lang === "pt" ? "Busca" : "Search"}</h1>
      <p>{lang === "pt" ? "Funcionalidade em desenvolvimento." : "Feature under construction."}</p>
    </section>
  );
}
