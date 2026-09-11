import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import DataTable from "../../components/DataTable/DataTable";
import { apiService, ENDPOINTS } from "../../api/client";

export default function UserList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .get(ENDPOINTS.USERS.LIST)
      .then((data) => setRows(data || []))
      .catch((e) => console.error("Failed to load users", e))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: "Member ID", accessor: "memberId", width: "20%" },
    { header: "Name", accessor: "name", width: "35%" },
    { header: "Department", accessor: "department", width: "25%" },
    { header: "Role", accessor: "role", width: "20%" },
  ];

  const tableRows = rows.map((u) => ({
    id: u.id,
    memberId: u.memberId,
    name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
    department: u.department || "-",
    role: u.role || "-",
  }));

  return (
    <Card>
      <Box p={3}>
        <Typography variant="h6">Users</Typography>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable columns={columns} rows={tableRows} searchable />
      )}
    </Card>
  );
}
