import { usePrefs } from "../lib/state/prefs";

type Props = {
  page: number; setPage:(n:number)=>void;
  total: number; pageSize: number;
};

export default function Pagination({ page,setPage,total,pageSize }: Props) {
  const { lang } = usePrefs();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const L = lang === "pt"
    ? {
        nav: "Paginação",
        page: "Página",
        first: "Primeira página",
        prev: "Página anterior",
        next: "Próxima página",
        last: "Última página",
      }
    : {
        nav: "Pagination",
        page: "Page",
        first: "First page",
        prev: "Previous page",
        next: "Next page",
        last: "Last page",
      };

  return (
    <nav className="pagination" aria-label={L.nav}>
      <button type="button" onClick={() => setPage(1)} disabled={page === 1} aria-label={L.first}>«</button>
      <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} aria-label={L.prev}>‹</button>
      <span aria-live="polite">{L.page} {page} / {pages}</span>
      <button type="button" onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} aria-label={L.next}>›</button>
      <button type="button" onClick={() => setPage(pages)} disabled={page === pages} aria-label={L.last}>»</button>
    </nav>
  );
}
