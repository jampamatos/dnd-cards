import { Link } from "react-router-dom";

export default function Header() {
    return (
        <nav style={ { display:"flex", gap:12, padding:"12px 0" }}>
            <Link to="/">Home</Link>
            <Link to="/browse">Navegar</Link>
            <Link to="/search">Busca</Link>
            <Link to="/pack">Pack</Link>
            <Link to="/print">Imprimir</Link>
            <Link to="/import">Importar</Link>
            <Link to="/about">Sobre</Link>
        </nav>
    );
}