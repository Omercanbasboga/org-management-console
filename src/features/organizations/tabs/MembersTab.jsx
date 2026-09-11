import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../../../components/DataTable/DataTable";
import { apiService, ENDPOINTS } from "../../../api/client";

export default function MembersTab({ orgId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiService
      .get(ENDPOINTS.MEMBERS.LIST_BY_ORG(orgId))
      .then((data) => setMembers(data || []))
      .catch((e) => console.error("Failed to load members", e))
      .finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  const remove = async (memberId) => {
    await apiService.delete(ENDPOINTS.MEMBERS.DELETE(orgId, memberId));
    load();
  };

  const columns = [
    { header: "Member ID", accessor: "memberId", width: "20%" },
    { header: "Name", accessor: "name", width: "30%" },
    { header: "Role", accessor: "role", width: "20%" },
    { header: "Joined", accessor: "joinedAt", width: "20%" },
    { header: "", accessor: "actions", width: "10%", align: "center" },
  ];

  const rows = members.map((m) => ({
    id: m.id,
    memberId: m.memberId,
    name: m.name,
    role: m.role,
    joinedAt: m.joinedAt,
    actions: (
      <IconButton size="small" color="error" onClick={() => remove(m.id)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    ),
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button startIcon={<AddIcon />} variant="outlined">
          Add member
        </Button>
      </Box>
      <DataTable columns={columns} rows={rows} searchable />
    </Box>
  );
}

MembersTab.propTypes = { orgId: PropTypes.string.isRequired };
