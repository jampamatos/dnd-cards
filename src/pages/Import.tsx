import { usePrefs } from "../lib/state/prefs";

export default function Import() {
  const { lang } = usePrefs();
  return <h2>{lang === "pt" ? "Importar Pacote" : "Import Pack"}</h2>;
}
