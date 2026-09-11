import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable from "../../components/DataTable/DataTable";
import { apiService, ENDPOINTS } from "../../api/client";

/**
 * List + create + delete for organizations (the original app called these
 * "clubs" — a student-club register). This mirrors that real screen: table
 * of orgs with name/category/president/advisor, a create button, and a
 * confirm-before-delete dialog.
 */
export default function OrganizationList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiService.get(ENDPOINTS.ORGANIZATIONS.LIST);
      setRows(data || []);
    } catch (e) {
      console.error("Failed to load organizations", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await apiService.delete(ENDPOINTS.ORGANIZATIONS.DELETE(pendingDelete.id));
    setPendingDelete(null);
    load();
  };

  const columns = [
    { header: "Name", accessor: "name", width: "30%" },
    { header: "Category", accessor: "category", width: "20%" },
    { header: "President", accessor: "president", width: "20%" },
    { header: "Advisor", accessor: "advisor", width: "20%" },
    { header: "Actions", accessor: "actions", width: "10%", align: "center" },
  ];

  const tableRows = rows.map((org) => ({
    id: org.id,
    name: (
      <Typography component={Link} to={`/organizations/${org.id}`} color="primary">
        {org.name}
      </Typography>
    ),
    category: org.category || "-",
    president: org.president?.name || "-",
    advisor: org.advisor?.name || "-",
    actions: (
      <Box>
        <IconButton size="small" onClick={() => navigate(`/organizations/${org.id}`)}>
          <InfoIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => setPendingDelete(org)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
  }));

  return (
    <Card>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <Box>
          <Typography variant="h6">Organizations</Typography>
          <Typography variant="body2" color="text.secondary">
            Registered community organizations and their management actions.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Organization
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable columns={columns} rows={tableRows} searchable />
      )}

      <Dialog open={!!pendingDelete} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete organization</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <b>{pendingDelete?.name}</b>? This cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
