import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { applyTheme } from "./styles/theme";
import App from "./App.tsx";

// @ts-ignore: virtual module provided by Vite PWA plugin
import { registerSW } from 'virtual:pwa-register'

applyTheme("system");
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <App />
  </BrowserRouter>
);
