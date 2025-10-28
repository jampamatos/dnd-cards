import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { PacksProvider } from "./lib/state/packs.ts";
import { PrefsProvider } from "./lib/state/prefs.ts";
import { applyTheme } from "./styles/theme";
import "./styles/ui.css";

// @ts-expect-error: virtual module is provided by Vite PWA plugin during build
import { registerSW } from "virtual:pwa-register";

const root = document.getElementById("root");
if (!root) throw new Error("Root container #root not found");

if (typeof window !== "undefined") {
  applyTheme("system");
  registerSW({ immediate: true });
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <PrefsProvider>
      <PacksProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </PacksProvider>
    </PrefsProvider>
  </StrictMode>
);
