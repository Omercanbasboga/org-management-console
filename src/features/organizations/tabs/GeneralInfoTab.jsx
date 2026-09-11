import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";

function InfoRow({ label, value }) {
  return (
    <Box display="flex" py={0.75}>
      <Typography variant="body2" fontWeight="bold" width="40%">
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" width="60%">
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default function GeneralInfoTab({ org }) {
  if (!org) return null;
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ p: 3, height: "100%" }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Organization details
          </Typography>
          <InfoRow label="Name" value={org.name} />
          <InfoRow label="Short name" value={org.shortName} />
          <InfoRow label="Description" value={org.description} />
          <InfoRow label="Founded" value={org.foundingDate} />
          <InfoRow label="Location" value={org.location} />
          <InfoRow label="Email" value={org.email} />
          <InfoRow label="Website" value={org.website} />
          <InfoRow label="Category" value={org.category} />
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold">
                  President
                </Typography>
              </Box>
              <InfoRow label="Name" value={org.president?.name} />
              <InfoRow label="Member ID" value={org.president?.memberId} />
              <InfoRow label="Email" value={org.president?.email} />
            </Card>
          </Grid>
          <Grid item>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <SchoolIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Advisor
                </Typography>
              </Box>
              <InfoRow label="Name" value={org.advisor?.name} />
              <InfoRow label="Department" value={org.advisor?.department} />
              <InfoRow label="Email" value={org.advisor?.email} />
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

GeneralInfoTab.propTypes = { org: PropTypes.object };
