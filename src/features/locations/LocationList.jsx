import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable from "../../components/DataTable/DataTable";
import { apiService, ENDPOINTS } from "../../api/client";

export default function LocationList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiService
      .get(ENDPOINTS.LOCATIONS.LIST)
      .then((data) => setRows(data || []))
      .catch((e) => console.error("Failed to load locations", e))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    await apiService.delete(ENDPOINTS.LOCATIONS.DELETE(id));
    load();
  };

  const columns = [
    { header: "Name", accessor: "name", width: "40%" },
    { header: "Capacity", accessor: "capacity", width: "30%" },
    { header: "", accessor: "actions", width: "30%", align: "center" },
  ];
  const tableRows = rows.map((l) => ({
    id: l.id,
    name: l.name,
    capacity: l.capacity ?? "-",
    actions: (
      <IconButton size="small" color="error" onClick={() => remove(l.id)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    ),
  }));

  return (
    <Card>
      <Box p={3}>
        <Typography variant="h6">Locations</Typography>
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
