import { usePrefs } from "../lib/state/prefs";

export default function Search() {
  const { lang } = usePrefs();
  return <h2>{lang === "pt" ? "Busca" : "Search"}</h2>;
}
