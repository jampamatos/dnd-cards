import { usePrefs } from "../lib/state/prefs";

export default function About() {
  const { lang } = usePrefs();
  const title = lang === "pt" ? "Sobre & Licenças" : "About & Licenses";
  return <h2>{title}</h2>;
}
