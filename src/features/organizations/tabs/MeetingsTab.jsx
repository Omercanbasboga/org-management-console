import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import EventIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusyOutlined";
import { useTheme } from "@mui/material/styles";
import { apiService, ENDPOINTS } from "../../../api/client";
import useLoad from "../../../hooks/useLoad";
import { useNotify } from "../../../components/Notify";
import StatusChip from "../../../components/StatusChip";
import StepTrack from "../../../components/StepTrack";
import ErrorNote from "../../../components/ErrorNote";
import { can } from "../roles";
import { queueChanged } from "../../../components/queueEvents";

const when = (iso) =>
  new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function Schedule({ open, onClose, orgId, onSaved }) {
  const notify = useNotify();
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    locationId: "",
    attendeeCount: "",
  });
  useEffect(() => {
    if (open)
      apiService
        .get(ENDPOINTS.LOCATIONS.LIST)
        .then(setRooms)
        .catch(() => {});
  }, [open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const room = rooms.find((r) => r.id === form.locationId);
  const save = async () => {
    try {
      await apiService.post(ENDPOINTS.MEETINGS.CREATE(orgId), {
        ...form,
        locationId: form.locationId || null,
        attendeeCount: form.attendeeCount ? Number(form.attendeeCount) : null,
        date: form.date.length === 16 ? `${form.date}:00` : form.date,
      });
      notify("Meeting sent for approval.");
      onSaved();
      queueChanged();
      onClose();
      setForm({
        title: "",
        description: "",
        date: "",
        locationId: "",
        attendeeCount: "",
      });
    } catch (e) {
      notify(e.message, "error");
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Schedule a meeting</DialogTitle>
      <DialogContent>
        <Box display="grid" gap={2} pt={1}>
          <TextField label="Title" value={form.title} onChange={set("title")} autoFocus required />
          <TextField
            label="When"
            type="datetime-local"
            value={form.date}
            onChange={set("date")}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField select label="Room" value={form.locationId} onChange={set("locationId")}>
            <MenuItem value="">No room</MenuItem>
            {rooms.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
                {r.capacity ? `, ${r.capacity} seats` : ""}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Expected attendees"
            type="number"
            value={form.attendeeCount}
            onChange={set("attendeeCount")}
            inputProps={{ min: 1 }}
            error={!!room?.capacity && Number(form.attendeeCount) > room.capacity}
            helperText={room?.capacity ? `${room.name} holds ${room.capacity}.` : " "}
          />
          <TextField
            label="Notes"
            value={form.description}
            onChange={set("description")}
            multiline
            minRows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!form.title.trim() || !form.date} onClick={save}>
          Send for approval
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MeetingRow({ m, canEdit, onCancel }) {
  const t = useTheme().tokens;
  const d = new Date(m.date);
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: "56px 1fr", sm: "56px 1fr auto" }}
      gap={2}
      alignItems="center"
      py={1.5}
      sx={{ borderTop: `1px solid ${t.line}` }}
    >
      <Box
        sx={{
          textAlign: "center",
          borderRadius: "10px",
          bgcolor: m.approved ? t.goodBg : t.pendingBg,
          py: 0.75,
        }}
      >
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, lineHeight: 1 }}>
          {d.getDate()}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {d.toLocaleString("en-GB", { month: "short" })}
        </Typography>
      </Box>
      <Box minWidth={0}>
        <Typography fontWeight={700}>{m.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {when(m.date)}
          {m.location ? `, ${m.location}` : ""}
          {m.attendeeCount ? `, ${m.attendeeCount} expected` : ""}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={1.5} gridColumn={{ xs: "2", sm: "auto" }}>
        {m.status.startsWith("PENDING") ? (
          <StepTrack status={m.status} />
        ) : (
          <StatusChip status={m.status} />
        )}
        {canEdit && (
          <Tooltip title="Cancel meeting">
            <IconButton size="small" onClick={() => onCancel(m)} aria-label={`Cancel ${m.title}`}>
              <EventBusyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

export default function MeetingsTab({ orgId, org, myRoles, admin }) {
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const { data, error, reload } = useLoad(
    () => apiService.get(ENDPOINTS.MEETINGS.LIST_BY_ORG(orgId)),
    [orgId]
  );
  const allowed = can.scheduleMeetings(myRoles, admin);
  if (error) return <ErrorNote error={error} what="the meetings" />;

  const d = new Date();
  const p2 = (n) => String(n).padStart(2, "0");
  const now = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
  const upcoming = (data || []).filter((m) => m.date >= now).reverse();
  const past = (data || []).filter((m) => m.date < now);
  const cancel = async (m) => {
    try {
      await apiService.delete(ENDPOINTS.MEETINGS.DELETE(orgId, m.id));
      notify(`${m.title} cancelled.`);
      reload();
      queueChanged();
    } catch (e) {
      notify(e.message, "error");
    }
  };

  return (
    <Box display="grid" gap={2}>
      <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "14px" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h3">Coming up</Typography>
          {allowed && org?.isActive && (
            <Button variant="contained" startIcon={<EventIcon />} onClick={() => setOpen(true)}>
              Schedule
            </Button>
          )}
        </Box>
        {!data ? (
          <Skeleton height={80} />
        ) : upcoming.length ? (
          upcoming.map((m) => <MeetingRow key={m.id} m={m} canEdit={allowed} onCancel={cancel} />)
        ) : (
          <Typography variant="body2" color="text.secondary" py={2}>
            Nothing scheduled.
          </Typography>
        )}
      </Paper>
      <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "14px" }}>
        <Typography variant="h3" mb={1}>
          Past meetings
        </Typography>
        {(past || []).map((m) => (
          <MeetingRow key={m.id} m={m} />
        ))}
        {data && !past.length && (
          <Typography variant="body2" color="text.secondary" py={2}>
            No meetings yet.
          </Typography>
        )}
      </Paper>
      <Schedule open={open} onClose={() => setOpen(false)} orgId={orgId} onSaved={reload} />
    </Box>
  );
}
