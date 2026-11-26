import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

// Where a request stands in the two-signature flow: advisor first, then admin.
function Dot({ state, t }) {
  const color = state === "done" ? t.good : state === "now" ? t.pending : t.line;
  return (
    <Box
      sx={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        bgcolor: state === "done" ? color : "transparent",
        boxShadow: state === "now" ? `0 0 0 4px ${t.pendingBg}` : "none",
        flexShrink: 0,
      }}
    />
  );
}

export default function StepTrack({ status, compact }) {
  const t = useTheme().tokens;
  const advisor = status === "PENDING_ADVISOR" ? "now" : "done";
  const admin = status === "PENDING_ADMIN" ? "now" : status === "APPROVED" ? "done" : "todo";
  const step = (label, state) => (
    <Box display="flex" alignItems="center" gap={0.75}>
      <Dot state={state} t={t} />
      {!compact && (
        <Typography
          variant="caption"
          sx={{
            color: state === "now" ? t.ink : t.ink2,
            fontWeight: state === "now" ? 700 : 500,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      aria-label={`Advisor ${advisor}, admin ${admin}`}
    >
      {step("Advisor", advisor)}
      <Box
        sx={{
          width: compact ? 14 : 22,
          height: 2,
          borderRadius: 1,
          bgcolor: advisor === "done" ? t.good : t.line,
        }}
      />
      {step("Admin", admin)}
    </Box>
  );
}
