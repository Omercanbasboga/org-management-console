import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import DataTable from "../../../components/DataTable/DataTable";
import { apiService, ENDPOINTS } from "../../../api/client";

export default function MeetingsTab({ orgId }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .get(ENDPOINTS.MEETINGS.LIST_BY_ORG(orgId))
      .then((data) => setMeetings(data || []))
      .catch((e) => console.error("Failed to load meetings", e))
      .finally(() => setLoading(false));
  }, [orgId]);

  const columns = [
    { header: "Title", accessor: "title", width: "35%" },
    { header: "Date", accessor: "date", width: "20%" },
    { header: "Status", accessor: "status", width: "25%" },
    { header: "Attendees", accessor: "attendeeCount", width: "20%" },
  ];

  const rows = meetings.map((m) => ({
    id: m.id,
    title: m.title,
    date: m.date,
    status: (
      <Chip
        size="small"
        label={m.approved ? "Approved" : "Pending approval"}
        color={m.approved ? "success" : "warning"}
      />
    ),
    attendeeCount: m.attendeeCount ?? 0,
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return <DataTable columns={columns} rows={rows} searchable />;
}

MeetingsTab.propTypes = { orgId: PropTypes.string.isRequired };
