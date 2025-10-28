import { usePrefs } from "../lib/state/prefs";

export default function About() {
  const { lang } = usePrefs();
  const title = lang === "pt" ? "Sobre & Licenças" : "About & Licenses";
  return (
    <section className="page container">
      <h1>{title}</h1>
      <p>{lang === "pt"
        ? "Projeto comunitário sem fins lucrativos. Dados derivados do SRD 5.1 sob licença CC-BY-4.0."
        : "Community project, not for profit. Data derived from SRD 5.1 under the CC-BY-4.0 license."}
      </p>
    </section>
  );
}
