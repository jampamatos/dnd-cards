import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.tsx";
import Home from "./pages/Home.tsx";
import Browse from "./pages/Browse.tsx";
import Search from "./pages/Search.tsx";
import PackBuilder from "./pages/PackBuilder.tsx";
import PrintPreview from "./pages/PrintPreview.tsx";
import Import from "./pages/Import.tsx";
import About from "./pages/About.tsx";

export default function App() {
  return(
    <div style= {{ maxWidth:960, margin:"0 auto", padding: "0 16px" }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/search" element={<Search />} />
        <Route path="/pack" element={<PackBuilder />} />
        <Route path="/print" element={<PrintPreview />} />
        <Route path="/import" element={<Import />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}