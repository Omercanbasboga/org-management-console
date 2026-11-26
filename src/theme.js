import { createTheme } from "@mui/material/styles";

export const TOKENS = {
  light: {
    page: "#F3F4F8",
    paper: "#FFFFFF",
    ink: "#1B2340",
    ink2: "#5A6079",
    muted: "#8A8FA3",
    line: "rgba(27,35,64,0.10)",
    rail: "#1B2340",
    railInk: "#C9CEE6",
    action: "#4453C9",
    pending: "#B87A00",
    pendingBg: "#FFF4DA",
    good: "#1E7F55",
    goodBg: "#E3F4EC",
    bad: "#BF3B33",
    badBg: "#FBE7E5",
    hover: "rgba(68,83,201,0.06)",
  },
  dark: {
    page: "#0F1324",
    paper: "#171C33",
    ink: "#E8EAF4",
    ink2: "#A9AEC6",
    muted: "#767C98",
    line: "rgba(255,255,255,0.09)",
    rail: "#0B0E1C",
    railInk: "#A9AEC6",
    action: "#8C97F2",
    pending: "#F2B84B",
    pendingBg: "rgba(242,184,75,0.14)",
    good: "#4CC38A",
    goodBg: "rgba(76,195,138,0.14)",
    bad: "#F07C73",
    badBg: "rgba(240,124,115,0.14)",
    hover: "rgba(140,151,242,0.10)",
  },
};

// one colour per club category, used for the monograms
export const CATEGORY_COLOR = {
  Arts: "#6250D6",
  Sports: "#14946A",
  Games: "#2A6FC9",
  "Science and technology": "#D2572A",
  Academic: "#B4467A",
};
export const categoryColor = (name) => CATEGORY_COLOR[name] || "#5A6079";

export const FONT = '"Figtree Variable", system-ui, -apple-system, "Segoe UI", sans-serif';

export function makeTheme(mode) {
  const t = TOKENS[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: t.action },
      success: { main: t.good },
      error: { main: t.bad },
      warning: { main: t.pending },
      background: { default: t.page, paper: t.paper },
      text: { primary: t.ink, secondary: t.ink2 },
      divider: t.line,
    },
    tokens: t,
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: FONT,
      h1: {
        fontSize: "1.9rem",
        fontWeight: 750,
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
      },
      h2: { fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em" },
      h3: { fontSize: "1rem", fontWeight: 700 },
      body1: { fontSize: "0.95rem" },
      body2: { fontSize: "0.86rem" },
      caption: { fontSize: "0.76rem" },
      button: { textTransform: "none", fontWeight: 650 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: { body: { fontFeatureSettings: '"tnum" 1' } },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: "none", border: `1px solid ${t.line}` },
        },
      },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 650, minHeight: 44 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: t.line },
          head: { color: t.ink2, fontWeight: 650 },
        },
      },
      MuiDialog: { styleOverrides: { paper: { border: "none" } } },
    },
  });
}
