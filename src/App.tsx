import { useEffect, useRef } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header.tsx";
import Home from "./pages/Home.tsx";
import Browse from "./pages/Browse.tsx";
import Search from "./pages/Search.tsx";
import PackBuilder from "./pages/PackBuilder.tsx";
import PrintPreview from "./pages/PrintPreview.tsx";
import Import from "./pages/Import.tsx";
import About from "./pages/About.tsx";
import DockSelection from "./components/DockSelection.tsx";

function MainFocus() {
  const { pathname } = useLocation();
  const firstRender = useRef(true);
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    main.focus();
  }, [pathname]);
  return null;
}

function AppLayout() {
  return (
    <>
      <Header />
      <MainFocus />
      <main id="main" tabIndex={-1} className="app-main">
        <Outlet />
      </main>
      <DockSelection />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/search" element={<Search />} />
        <Route path="/pack" element={<PackBuilder />} />
        <Route path="/print" element={<PrintPreview />} />
        <Route path="/import" element={<Import />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}
