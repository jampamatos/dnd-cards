import { usePrefs } from "../lib/state/prefs";

type Props = {
  page: number; setPage:(n:number)=>void;
  total: number; pageSize: number;
};

export default function Pagination({ page,setPage,total,pageSize }: Props) {
  const { lang } = usePrefs();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const label = lang === "pt" ? "Página" : "Page";

  return (
    <div className="pagination">
      <button onClick={()=>setPage(1)} disabled={page===1}>«</button>
      <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1}>‹</button>
      <span>{label} {page} / {pages}</span>
      <button onClick={()=>setPage(Math.min(pages,page+1))} disabled={page===pages}>›</button>
      <button onClick={()=>setPage(pages)} disabled={page===pages}>»</button>
    </div>
  );
}
