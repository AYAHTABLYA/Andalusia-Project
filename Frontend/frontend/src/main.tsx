import "./styles/design-system.css";
import "./styles/dark-mode.css";
import { applyTheme, getInitialTheme } from "./utils/theme";
import { createRoot } from "react-dom/client";
import "material-symbols/outlined.css";
import App from "./App.tsx";

applyTheme(getInitialTheme());

createRoot(document.getElementById("root")!).render(<App />);
