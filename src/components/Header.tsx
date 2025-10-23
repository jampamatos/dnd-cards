import { Link } from "react-router-dom";
import { usePrefs } from "../lib/state/prefs";
import { applyTheme } from "../styles/theme";

export default function Header() {
    const { lang, setLang, theme, setTheme } = usePrefs();
    return (
        <nav className="no-print" style={{ display:"flex", gap:12, padding:"12px 0", alignItems:"center", flexWrap:"wrap" }}>
            <Link to="/">Home</Link>
            <Link to="/browse">Navegar</Link>
            <Link to="/search">Busca</Link>
            <Link to="/pack">Pack</Link>
            <Link to="/print">Imprimir</Link>
            <Link to="/import">Importar</Link>
            <Link to="/about">Sobre</Link>

            <span style={{ marginLeft:"auto" }} />

            <label style={{ display:"flex", alignItems:"center", gap:6 }}>
                Idioma:
                <select value={lang} onChange={e=>setLang(e.target.value as "pt"|"en")}>
                    <option value="pt">PT</option>
                    <option value="en">EN</option>
                </select>
            </label>

            <label style={{ display:"flex", alignItems:"center", gap:6}}>
                Tema:
                <select
                    value={theme}
                    onChange={e=>{
                        const t = e.target.value as "system"|"light"|"dark";
                        setTheme(t); applyTheme(t);
                    }}
                >
                    <option value="system">Sistema</option>
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                </select>
            </label>
        </nav>
    );
}