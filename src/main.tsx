import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PrefsProvider } from "./lib/state/prefs.ts";
import { applyTheme } from "./styles/theme";
import "./styles/ui.css"
import App from "./App.tsx";

// @ts-ignore: virtual module provided by Vite PWA plugin
import { registerSW } from 'virtual:pwa-register'
import { PacksProvider } from "./lib/state/packs.ts";

applyTheme("system");
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById("root")!).render(
  <PrefsProvider>
    <PacksProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </PacksProvider>
  </PrefsProvider>
);
