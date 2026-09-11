import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable from "../../components/DataTable/DataTable";
import { apiService, ENDPOINTS } from "../../api/client";

export default function CategoryList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiService
      .get(ENDPOINTS.CATEGORIES.LIST)
      .then((data) => setRows(data || []))
      .catch((e) => console.error("Failed to load categories", e))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    await apiService.delete(ENDPOINTS.CATEGORIES.DELETE(id));
    load();
  };

  const columns = [
    { header: "Name", accessor: "name", width: "70%" },
    { header: "", accessor: "actions", width: "30%", align: "center" },
  ];
  const tableRows = rows.map((c) => ({
    id: c.id,
    name: c.name,
    actions: (
      <IconButton size="small" color="error" onClick={() => remove(c.id)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    ),
  }));

  return (
    <Card>
      <Box p={3}>
        <Typography variant="h6">Categories</Typography>
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
