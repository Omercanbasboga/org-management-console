import { createContext, useCallback, useContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const NotifyContext = createContext(() => {});

/**
 * One toast at a time. Errors show the server's own message: the service
 * explains its refusals ("This request is waiting for the organization's
 * advisor"), and that text is more useful than a generic failure.
 */
export function NotifyProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const notify = useCallback(
    (text, severity = "success") => setMsg({ text, severity, key: Date.now() }),
    []
  );
  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <Snackbar
        key={msg?.key}
        open={!!msg}
        autoHideDuration={msg?.severity === "error" ? 6000 : 3500}
        onClose={() => setMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {msg ? (
          <Alert severity={msg.severity} variant="filled" onClose={() => setMsg(null)}>
            {msg.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotifyContext.Provider>
  );
}

export const useNotify = () => useContext(NotifyContext);
