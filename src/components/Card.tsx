type CardProps = {
    titlePt: string;
    titleEn: string;
    schoolPt: string;
    schoolEn: string;
    pills: string[];        // i.e. ["Level 1", "Action", "Touch", "Instantaneous"]
    bodyPt: string;
    bodyEn: string;
};

export default function Card({ titlePt, titleEn, schoolPt, schoolEn, pills, bodyPt, bodyEn }: CardProps) {
    return (
        <article style={{ border:"1px solid #ddd", borderRadius:8, padding:12, breakInside:"auto" }}>
            <h3 style={{ margin:0, fontWeight:700 }}>
                {titlePt} <span style={{ opacity:.7 }}> / {titleEn}</span>
            </h3>
            <h4 style={{ margin:0, fontWeight:500, fontSize:14 }}>{schoolPt} <span style={{ opacity:.7 }}> / {schoolEn}</span></h4>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, margin:"8px 0" }}>
                {pills.map((p, i) => (
                    <span key={i} style={{ fontSize:12, border:"1px solid #ccc", borderRadius:999, padding:"2px 8px" }}>
                        {p}
                    </span>
                ))}
            </div>
            <p style={{ marginTop:8 }}>{bodyPt}</p>
            {/* We will add a PT/EN toggle button here later */}
        </article>
    );
}