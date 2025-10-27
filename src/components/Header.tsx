import { Link, useLocation } from "react-router-dom";
import { usePrefs } from "../lib/state/prefs";
import { applyTheme } from "../styles/theme";

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

  const linkStyle = (to: string) => ({
    padding: "4px 8px",
    borderRadius: 6,
    textDecoration: "none",
    border: "1px solid #3333",
    background: pathname === to ? "#eef5ff" : "transparent",
  });

  return (
    <nav className="no-print" style={{ display:"flex", gap:12, padding:"12px 0", alignItems:"center", flexWrap:"wrap" }}>
      <Link to="/" style={linkStyle("/")}>{L.home}</Link>
      <Link to="/browse" style={linkStyle("/browse")}>{L.browse}</Link>
      <Link to="/search" style={linkStyle("/search")}>{L.search}</Link>
      <Link to="/pack" style={linkStyle("/pack")}>{L.pack}</Link>
      <Link to="/print" style={linkStyle("/print")}>{L.print}</Link>
      <Link to="/import" style={linkStyle("/import")}>{L.import}</Link>
      <Link to="/about" style={linkStyle("/about")}>{L.about}</Link>

      <span style={{ marginLeft:"auto" }} />

      <label style={{ display:"flex", alignItems:"center", gap:6 }}>
        {L.language}:
        <select
          value={lang}
          onChange={(e)=>setLang(e.target.value as "pt"|"en")}
        >
          <option value="pt">PT</option>
          <option value="en">EN</option>
        </select>
      </label>

      <label style={{ display:"flex", alignItems:"center", gap:6}}>
        {L.theme}:
        <select
          value={theme}
          onChange={e=>{
            const t = e.target.value as "system"|"light"|"dark";
            setTheme(t);
            applyTheme(t); // apply immediately
          }}
        >
          <option value="system">{L.system}</option>
          <option value="light">{L.light}</option>
          <option value="dark">{L.dark}</option>
        </select>
      </label>
    </nav>
  );
}
