import { usePrefs } from "../lib/state/prefs";

export default function Import() {
  const { lang } = usePrefs();
  return (
    <section className="page container">
      <h1>{lang === "pt" ? "Importar Pacote" : "Import Pack"}</h1>
      <p>{lang === "pt" ? "Cole os dados do pacote exportado para restaurar sua seleção." : "Paste an exported pack to restore your selection."}</p>
    </section>
  );
}
