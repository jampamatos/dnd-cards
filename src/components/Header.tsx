"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { usePrefs } from "../lib/state/prefs"
import type { Theme } from "../styles/theme"
import logoUrl from "../assets/logo.png"

export default function Header() {
  const { lang, setLang, theme, setTheme } = usePrefs()
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const L = {
    pt: {
      nav: "Navegação principal",
      skip: "Ir para o conteúdo",
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
      toggleMenu: "Alternar menu",
      toggleLang: lang === "pt" ? "Mudar para inglês" : "Mudar para português",
      toggleTheme: theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro",
    },
    en: {
      nav: "Main navigation",
      skip: "Skip to content",
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
      toggleMenu: "Toggle menu",
      toggleLang: lang === "pt" ? "Switch to English" : "Switch to Portuguese",
      toggleTheme: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    },
  }[lang]

  const links = [
    { to: "/browse", label: L.browse },
    { to: "/search", label: L.search },
    { to: "/pack", label: L.pack },
    { to: "/print", label: L.print },
    { to: "/import", label: L.import },
    { to: "/about", label: L.about },
  ]

  const toggleLanguage = () => {
    setLang(lang === "pt" ? "en" : "pt")
  }

  const cycleTheme = () => {
    const themes: Theme[] = ["system", "light", "dark"]
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="site-header no-print">
      <a href="#main" className="skip">
        {L.skip}
      </a>
      <nav className="container site-header__nav" aria-label={L.nav}>
        <Link to="/" className="site-logo" aria-label="D&D Cards - Home">
          <img src={logoUrl} alt="D&D Cards" width="120" height="40" />
        </Link>

        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={L.toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`toolbar__list ${mobileMenuOpen ? "toolbar__list--open" : ""}`}>
          {links.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} aria-current={pathname === to ? "page" : undefined} onClick={handleLinkClick}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="toolbar__actions">
          <button className="icon-btn" onClick={toggleLanguage} aria-label={L.toggleLang} title={L.toggleLang}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="icon-btn__label">{lang.toUpperCase()}</span>
          </button>

          <button className="icon-btn" onClick={cycleTheme} aria-label={L.toggleTheme} title={L.toggleTheme}>
            {theme === "dark" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : theme === "light" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72 1.42-1.42" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8m-4-4v4" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
