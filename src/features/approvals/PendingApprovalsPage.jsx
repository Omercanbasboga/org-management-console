import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DataTable from "../../components/DataTable/DataTable";
import { apiService, ENDPOINTS } from "../../api/client";

const QUEUE_TYPES = ["meeting", "membership", "bylaws"];
const QUEUE_LABELS = { meeting: "Meetings", membership: "Membership requests", bylaws: "Bylaws" };

/**
 * A single approval queue that renders three different entity types
 * (meetings, membership requests, bylaws uploads) through one generic
 * table + one approve/reject confirmation dialog, keyed by `type` — the
 * same "write the shared shape once" idea as AssignmentTab in the
 * companion iam-admin-console repo, applied to an approval workflow
 * instead of a permission-assignment workflow.
 */
export default function PendingApprovalsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [queues, setQueues] = useState({ meeting: [], membership: [], bylaws: [] });
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null); // { type, id, label, approve }

  const load = () => {
    setLoading(true);
    apiService
      .get(ENDPOINTS.APPROVALS.QUEUE)
      .then((data) => {
        setQueues({
          meeting: data?.meetings || [],
          membership: data?.membershipRequests || [],
          bylaws: data?.bylawsUploads || [],
        });
      })
      .catch((e) => console.error("Failed to load approval queue", e))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirm = async () => {
    if (!pendingAction) return;
    const { id, approve } = pendingAction;
    if (approve) {
      await apiService.put(ENDPOINTS.APPROVALS.APPROVE(id));
    } else {
      await apiService.delete(ENDPOINTS.APPROVALS.REJECT(id));
    }
    setPendingAction(null);
    load();
  };

  const columnsFor = (type) => {
    const base = [
      { header: "Item", accessor: "label", width: "35%" },
      { header: "Organization", accessor: "orgName", width: "30%" },
      { header: "Status", accessor: "status", width: "20%" },
      { header: "", accessor: "actions", width: "15%", align: "center" },
    ];
    return base;
  };

  const rowsFor = (type) =>
    (queues[type] || []).map((item) => ({
      id: item.id,
      label: item.title || item.name || item.fileName,
      orgName: item.organizationName || "-",
      status: <Chip size="small" label="Pending approval" color="warning" />,
      actions: (
        <Box>
          <IconButton
            size="small"
            color="success"
            onClick={() =>
              setPendingAction({ type, id: item.id, label: item.title || item.name || item.fileName, approve: true })
            }
          >
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() =>
              setPendingAction({ type, id: item.id, label: item.title || item.name || item.fileName, approve: false })
            }
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    }));

  const currentType = QUEUE_TYPES[activeTab];

  return (
    <Card>
      <Box p={3} pb={0}>
        <Typography variant="h6">Pending Approvals</Typography>
        <Typography variant="body2" color="text.secondary">
          Review and act on everything waiting for your sign-off.
        </Typography>
      </Box>
      <Box p={3}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          {QUEUE_TYPES.map((type, i) => (
            <Tab key={type} label={`${QUEUE_LABELS[type]} (${queues[type].length})`} />
          ))}
        </Tabs>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable columns={columnsFor(currentType)} rows={rowsFor(currentType)} searchable />
        )}
      </Box>

      <Dialog open={!!pendingAction} onClose={() => setPendingAction(null)} fullWidth maxWidth="xs">
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <Typography fontWeight="bold" mb={1}>
            {pendingAction?.label}
          </Typography>
          <Typography>
            Are you sure you want to {pendingAction?.approve ? "approve" : "reject"} this?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={pendingAction?.approve ? "success" : "error"}
            onClick={confirm}
          >
            {pendingAction?.approve ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
