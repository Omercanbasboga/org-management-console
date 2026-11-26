import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

const LABEL = {
  PENDING_ADVISOR: "Waiting for advisor",
  PENDING_ADMIN: "Waiting for admin",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function StatusChip({ status }) {
  const t = useTheme().tokens;
  const pending = status?.startsWith("PENDING");
  const [fg, bg] = pending
    ? [t.pending, t.pendingBg]
    : status === "APPROVED"
      ? [t.good, t.goodBg]
      : [t.bad, t.badBg];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.25,
        borderRadius: 99,
        bgcolor: bg,
        color: fg,
        fontSize: "0.74rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {LABEL[status] || status}
    </Box>
  );
}
