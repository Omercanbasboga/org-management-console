import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/figtree/wght.css";
import App from "./App";
import { PersonaProvider } from "./persona";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <PersonaProvider>
        <App />
      </PersonaProvider>
    </BrowserRouter>
  </React.StrictMode>
);
