import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

function Row({ label, children }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="120px 1fr"
      gap={2}
      py={1}
      sx={{ borderTop: 1, borderColor: "divider" }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div">
        {children || "–"}
      </Typography>
    </Box>
  );
}

function Person({ title, p, note }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: "14px" }}>
      <Typography variant="h3" mb={1}>
        {title}
      </Typography>
      {p ? (
        <>
          <Row label="Name">{p.name}</Row>
          {p.memberId && <Row label="Number">{p.memberId}</Row>}
          {p.department && <Row label="Department">{p.department}</Row>}
          <Row label="Email">
            <Link href={`mailto:${p.email}`}>{p.email}</Link>
          </Row>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {note}
        </Typography>
      )}
    </Paper>
  );
}

export default function GeneralInfoTab({ org }) {
  if (!org) return null;
  return (
    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "3fr 2fr" }} gap={2}>
      <Paper sx={{ p: 2.5, borderRadius: "14px" }}>
        <Typography variant="h3" mb={1}>
          About
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          {org.description}
        </Typography>
        <Row label="Short name">{org.shortName}</Row>
        <Row label="Category">{org.category}</Row>
        <Row label="Usual room">{org.location}</Row>
        <Row label="Founded">{org.foundingDate}</Row>
        <Row label="Email">
          {org.email && <Link href={`mailto:${org.email}`}>{org.email}</Link>}
        </Row>
        <Row label="Members">{org.memberCount}</Row>
      </Paper>
      <Box display="grid" gap={2} alignContent="start">
        <Person title="President" p={org.president} note="No president at the moment." />
        <Person
          title="Advisor"
          p={org.advisor}
          note="No advisor: this club's requests go straight to the admin step."
        />
      </Box>
    </Box>
  );
}
