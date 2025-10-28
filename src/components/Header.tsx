import { Link, useLocation } from "react-router-dom";
import { usePrefs } from "../lib/state/prefs";

export default function Header() {
  const { lang, setLang, theme, setTheme } = usePrefs();
  const { pathname } = useLocation();

  const L = {
    pt: {
      home: "Início",
      browse: "Navegar",
      search: "Busca",
      pack: "Pack",
      print: "Imprimir",
      import: "Importar",
      about: "Sobre",
      language: "Idioma",
      theme: "Tema",
      system: "Sistema",
      light: "Claro",
      dark: "Escuro",
    },
    en: {
      home: "Home",
      browse: "Browse",
      search: "Search",
      pack: "Pack",
      print: "Print",
      import: "Import",
      about: "About",
      language: "Language",
      theme: "Theme",
      system: "System",
      light: "Light",
      dark: "Dark",
    },
  }[lang];

  return (
  <nav className="no-print toolbar container">
    <Link to="/" aria-current={pathname === "/" ? "page" : undefined}>{L.home}</Link>
    <Link to="/browse" aria-current={pathname === "/browse" ? "page" : undefined}>{L.browse}</Link>
    <Link to="/search" aria-current={pathname === "/search" ? "page" : undefined}>{L.search}</Link>
    <Link to="/pack" aria-current={pathname === "/pack" ? "page" : undefined}>{L.pack}</Link>
    <Link to="/print" aria-current={pathname === "/print" ? "page" : undefined}>{L.print}</Link>
    <Link to="/import" aria-current={pathname === "/import" ? "page" : undefined}>{L.import}</Link>
    <Link to="/about" aria-current={pathname === "/about" ? "page" : undefined}>{L.about}</Link>

    <span style={{ marginLeft:"auto" }} />

    <label style={{ display:"flex", alignItems:"center", gap:6 }}>
      {L.language}:
      <select value={lang} onChange={(e)=>setLang(e.target.value as "pt"|"en")}>
        <option value="pt">PT</option><option value="en">EN</option>
      </select>
    </label>

    <label style={{ display:"flex", alignItems:"center", gap:6}}>
      {L.theme}:
      <select value={theme} onChange={e=>setTheme(e.target.value as any)}>
        <option value="system">{L.system}</option>
        <option value="light">{L.light}</option>
        <option value="dark">{L.dark}</option>
      </select>
    </label>
  </nav>
);
}
