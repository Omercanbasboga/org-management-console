import { createContext, useContext, useEffect, useMemo, useState } from "react";

// The demo has no identity provider: the viewer picks who to be. The choice
// goes out as the X-Demo-User header, which the backend's demo profile reads
// (and the in-browser simulation reads the same way).

const KEY = "omc:persona";
const DEFAULT = "admin@example.org";

const PersonaContext = createContext({ email: DEFAULT, setEmail: () => {} });

function read() {
  try {
    return localStorage.getItem(KEY) || DEFAULT;
  } catch {
    return DEFAULT;
  }
}

let current = read();
export const currentPersona = () => current;

export function PersonaProvider({ children }) {
  const [email, setEmailState] = useState(current);
  useEffect(() => {
    current = email;
    try {
      localStorage.setItem(KEY, email);
    } catch {
      /* storage blocked */
    }
  }, [email]);
  const value = useMemo(
    () => ({
      email,
      setEmail: (e) => {
        current = e;
        setEmailState(e);
      },
    }),
    [email]
  );
  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export const usePersona = () => useContext(PersonaContext);

/** Admin plus the president and advisor of each organization, built from the org list. */
export function personasFrom(orgs) {
  const list = [{ email: DEFAULT, name: "Demo Admin", label: "Admin" }];
  orgs.forEach((o) => {
    if (o.advisor?.email)
      list.push({
        email: o.advisor.email,
        name: o.advisor.name,
        label: `Advisor, ${o.name}`,
      });
    if (o.president?.email)
      list.push({
        email: o.president.email,
        name: o.president.name,
        label: `President, ${o.name}`,
      });
  });
  return list;
}
