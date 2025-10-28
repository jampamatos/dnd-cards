import { useId, type ChangeEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePrefs } from "../lib/state/prefs";
import type { Theme } from "../styles/theme";

export default function Header() {
  const { lang, setLang, theme, setTheme } = usePrefs();
  const { pathname } = useLocation();
  const langFieldId = useId();
  const themeFieldId = useId();

  const L = {
    pt: {
      nav: "Navegação principal",
      skip: "Ir para o conteúdo",
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
      nav: "Main navigation",
      skip: "Skip to content",
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

  const links = [
    { to: "/", label: L.home },
    { to: "/browse", label: L.browse },
    { to: "/search", label: L.search },
    { to: "/pack", label: L.pack },
    { to: "/print", label: L.print },
    { to: "/import", label: L.import },
    { to: "/about", label: L.about },
  ];

  const handleLangChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    if (next === "pt" || next === "en") {
      setLang(next);
    }
  };

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as Theme;
    if (next === "light" || next === "dark" || next === "system") {
      setTheme(next);
    }
  };

  return (
    <header className="site-header no-print">
      {/* Skip link for keyboard/screen reader users */}
      <a href="#main" className="skip">{L.skip}</a>
      <nav className="container site-header__nav" aria-label={L.nav}>
        <ul className="toolbar__list">
          {links.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                aria-current={pathname === to ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="toolbar__actions">
          <label className="toolbar__control" htmlFor={langFieldId}>
            <span>{L.language}</span>
            <select
              id={langFieldId}
              value={lang}
              onChange={handleLangChange}
            >
              <option value="pt">PT</option>
              <option value="en">EN</option>
            </select>
          </label>

          <label className="toolbar__control" htmlFor={themeFieldId}>
            <span>{L.theme}</span>
            <select
              id={themeFieldId}
              value={theme}
              onChange={handleThemeChange}
            >
              <option value="system">{L.system}</option>
              <option value="light">{L.light}</option>
              <option value="dark">{L.dark}</option>
            </select>
          </label>
        </div>
      </nav>
    </header>
  );
}
