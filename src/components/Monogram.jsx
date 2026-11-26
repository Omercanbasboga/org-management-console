import Box from "@mui/material/Box";
import { categoryColor } from "../theme";

const SKIP = new Set(["of", "and", "the", "for", "&"]);

/** Initials on the club's category colour; stands in for a logo. */
export function initials(name = "?") {
  const words = name.split(/\s+/).filter((w) => w && !SKIP.has(w.toLowerCase()));
  return (
    words.length > 1 ? words[0][0] + words[1][0] : words[0]?.slice(0, 2) || "?"
  ).toLocaleUpperCase("tr");
}

export default function Monogram({ org, size = 44 }) {
  const text = initials(org?.name);
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: `${Math.round(size * 0.28)}px`,
        bgcolor: categoryColor(org?.category),
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: size * 0.36,
        letterSpacing: "0.02em",
      }}
    >
      {text}
    </Box>
  );
}
