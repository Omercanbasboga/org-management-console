import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import { apiService, ENDPOINTS } from "../../api/client";
import useLoad from "../../hooks/useLoad";
import { usePersona } from "../../persona";
import { useNotify } from "../../components/Notify";
import PageHeader from "../../components/PageHeader";
import StepTrack from "../../components/StepTrack";
import ErrorNote from "../../components/ErrorNote";
import { queueChanged } from "../../components/queueEvents";

const KINDS = [
  { key: "membershipRequests", label: "Members", noun: "membership" },
  { key: "meetings", label: "Meetings", noun: "meeting" },
  { key: "bylawsUploads", label: "Bylaws", noun: "bylaws upload" },
];

const ago = (iso) => {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
};

/**
 * One queue for three kinds of request. Each row shows where the request is
 * in the two-signature flow; the list itself only holds what the current
 * person can sign right now, so switching persona changes what you see.
 */
export default function PendingApprovalsPage() {
  const t = useTheme().tokens;
  const notify = useNotify();
  const { email } = usePersona();
  const [tab, setTab] = useState(0);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(null);
  const { data, error, reload } = useLoad(() => apiService.get(ENDPOINTS.APPROVALS.QUEUE));

  const sign = async (item) => {
    setBusy(item.id);
    try {
      const r = await apiService.put(ENDPOINTS.APPROVALS.APPROVE(item.id));
      notify(
        r?.status === "APPROVED"
          ? `${item.title}: approved.`
          : `${item.title}: signed. It now waits for an admin.`
      );
      reload();
      queueChanged();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  };
  const reject = async () => {
    const item = rejecting;
    setRejecting(null);
    try {
      await apiService.delete(ENDPOINTS.APPROVALS.REJECT(item.id, reason.trim()));
      notify(`${item.title}: turned down.`, "info");
      reload();
      queueChanged();
    } catch (e) {
      notify(e.message, "error");
    }
    setReason("");
  };

  if (error) return <ErrorNote error={error} what="the queue" />;
  const kind = KINDS[tab];
  const items = data?.[kind.key] || [];
  const total = data ? KINDS.reduce((n, k) => n + data[k.key].length, 0) : null;
  const admin = email === "admin@example.org";

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle={
          total == null
            ? " "
            : total
              ? `${total} request${total === 1 ? "" : "s"} waiting for your signature.`
              : "Nothing is waiting for your signature."
        }
      />
      <Paper
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: "14px",
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
          bgcolor: t.page,
        }}
      >
        <StepTrack status="PENDING_ADVISOR" />
        <Typography variant="body2" color="text.secondary" flex={1} minWidth={240}>
          New members, meetings and bylaws need two signatures: the club's advisor first, then an
          admin.
          {admin
            ? " As an admin you see what advisors have already signed."
            : " As an advisor you see your club's new requests."}
        </Typography>
      </Paper>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
        variant="scrollable"
      >
        {KINDS.map((k) => (
          <Tab key={k.key} label={`${k.label}${data ? ` (${data[k.key].length})` : ""}`} />
        ))}
      </Tabs>

      <Box display="grid" gap={1.5}>
        {!data && [0, 1].map((i) => <Skeleton key={i} variant="rounded" height={96} />)}
        {items.map((item) => (
          <Paper
            key={item.id}
            sx={{
              p: 2,
              borderRadius: "14px",
              display: "grid",
              alignItems: "center",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1fr) auto auto",
              },
            }}
          >
            <Box minWidth={0}>
              <Typography fontWeight={700}>{item.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                <Link
                  component={RouterLink}
                  to={`/organizations/${item.organizationId}`}
                  color="inherit"
                >
                  {item.organizationName}
                </Link>
                {`, asked ${ago(item.requestedAt)}`}
                {item.requestedBy ? ` by ${item.requestedBy}` : ""}
              </Typography>
            </Box>
            <StepTrack status={item.status} />
            <Box display="flex" gap={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setRejecting(item)}
                disabled={busy === item.id}
              >
                Turn down
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => sign(item)}
                disabled={busy === item.id}
              >
                {item.status === "PENDING_ADVISOR" ? "Sign" : "Approve"}
              </Button>
            </Box>
          </Paper>
        ))}
        {data && !items.length && (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderStyle: "dashed",
              borderRadius: "14px",
            }}
          >
            <Typography fontWeight={700} mb={0.5}>
              No {kind.noun} requests for you
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {admin
                ? "Requests reach you once the club's advisor has signed. Switch to an advisor at the top right to sign the first step."
                : "Switch to the admin at the top right to see what is waiting for the second signature."}
            </Typography>
          </Paper>
        )}
      </Box>

      <Dialog open={!!rejecting} onClose={() => setRejecting(null)} fullWidth maxWidth="xs">
        <DialogTitle>Turn down this request?</DialogTitle>
        <DialogContent>
          <Typography fontWeight={700} mb={1.5}>
            {rejecting?.title}
          </Typography>
          <TextField
            fullWidth
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={2}
            helperText="The requester sees this."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejecting(null)}>Keep it</Button>
          <Button variant="contained" color="error" onClick={reject}>
            Turn down
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
