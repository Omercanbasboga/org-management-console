import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import Shell from "./layout/Shell";
import SignIn from "./pages/sign-in/SignIn";
import routes from "./routes";
import { makeTheme } from "./theme";
import { NotifyProvider } from "./components/Notify";

function initialMode() {
  try {
    const saved = localStorage.getItem("omc:theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage blocked */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [mode, setMode] = useState(initialMode);
  const theme = useMemo(() => makeTheme(mode), [mode]);
  const toggleMode = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    try {
      localStorage.setItem("omc:theme", next);
    } catch {
      /* storage blocked */
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotifyProvider>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route
            path="/*"
            element={
              <Shell mode={mode} toggleMode={toggleMode}>
                <Routes>
                  {routes.map(({ path, component: Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                  ))}
                  <Route path="*" element={<Navigate to="/organizations" replace />} />
                </Routes>
              </Shell>
            }
          />
        </Routes>
      </NotifyProvider>
    </ThemeProvider>
  );
}
