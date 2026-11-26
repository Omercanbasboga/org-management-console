import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

/** A refused or failed load, explained in place of the content. */
export default function ErrorNote({ error, what }) {
  const forbidden = error?.status === 403;
  return (
    <Paper sx={{ p: 3, textAlign: "center", borderStyle: "dashed" }}>
      <Typography fontWeight={700} mb={0.5}>
        {forbidden ? `You can't see ${what} as this person` : `Couldn't load ${what}`}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {error?.message}
        {forbidden ? " Switch persona at the top right to see it from another seat." : ""}
      </Typography>
    </Paper>
  );
}
