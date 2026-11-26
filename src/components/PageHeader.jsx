import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="flex-end"
      justifyContent="space-between"
      gap={2}
      mb={3}
    >
      <Box maxWidth={720}>
        <Typography variant="h1" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" mt={0.75}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
