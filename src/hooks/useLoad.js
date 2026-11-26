import { useCallback, useEffect, useRef, useState } from "react";
import { usePersona } from "../persona";

/**
 * Loads data and reloads when the persona changes, since what you may see
 * depends on who you are. Keeps the last data while reloading, so a refresh
 * doesn't flash an empty table.
 */
export default function useLoad(fn, deps = []) {
  const { email } = usePersona();
  const [state, setState] = useState({
    data: undefined,
    error: null,
    loading: true,
  });
  const call = useRef(0);

  const reload = useCallback(() => {
    const n = ++call.current;
    setState((s) => ({ ...s, loading: true }));
    fn()
      .then((data) => n === call.current && setState({ data, error: null, loading: false }))
      .catch((error) => n === call.current && setState({ data: undefined, error, loading: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, ...deps]);

  useEffect(reload, [reload]);
  return { ...state, reload };
}
