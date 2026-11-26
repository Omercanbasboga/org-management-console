import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import PersonRemoveIcon from "@mui/icons-material/PersonRemoveOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAddAlt1";
import { apiService, ENDPOINTS } from "../../../api/client";
import { usePersona } from "../../../persona";
import { useNotify } from "../../../components/Notify";
import DataTable from "../../../components/DataTable";
import ErrorNote from "../../../components/ErrorNote";
import { can, OFFICERS, roleLabel } from "../roles";
import { queueChanged } from "../../../components/queueEvents";

function AddMember({ open, onClose, orgId, onAdded }) {
  const notify = useNotify();
  const [people, setPeople] = useState([]);
  const [person, setPerson] = useState(null);
  const [role, setRole] = useState("MEMBER");
  useEffect(() => {
    if (open)
      apiService
        .get(ENDPOINTS.USERS.LIST)
        .then(setPeople)
        .catch((e) => notify(e.message, "error"));
  }, [open, notify]);
  const add = async () => {
    try {
      const m = await apiService.post(ENDPOINTS.MEMBERS.CREATE(orgId), {
        personId: person.id,
        role,
      });
      notify(
        `${m.name} added. The request now waits for ${m.status === "PENDING_ADVISOR" ? "the advisor" : "an admin"}.`
      );
      onAdded();
      queueChanged();
      onClose();
    } catch (e) {
      notify(e.message, "error");
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add a member</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          New members and new roles go through approval before they count.
        </Typography>
        <Autocomplete
          options={people.filter((p) => p.role !== "ADMIN")}
          getOptionLabel={(p) => `${p.firstName} ${p.lastName}`}
          renderOption={(props, p) => (
            <li {...props} key={p.id}>
              <Box>
                <Typography variant="body2" fontWeight={650}>
                  {p.firstName} {p.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {p.department}, {p.memberId}
                </Typography>
              </Box>
            </li>
          )}
          value={person}
          onChange={(_, v) => setPerson(v)}
          renderInput={(params) => <TextField {...params} label="Person" autoFocus />}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          fullWidth
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {[...OFFICERS, "MEMBER"].map((r) => (
            <MenuItem key={r} value={r}>
              {roleLabel(r)}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!person} onClick={add}>
          Send for approval
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MembersTab({ orgId, org, myRoles, admin, members }) {
  const { email } = usePersona();
  const notify = useNotify();
  const [adding, setAdding] = useState(false);
  const manage = can.manageMembers(myRoles, admin);

  const join = async () => {
    try {
      const users = await apiService.get(ENDPOINTS.USERS.LIST).catch(() => null);
      const me = users?.find((u) => u.email === email);
      if (!me)
        throw new Error("Your record isn't in the directory, so you can't ask to join from here.");
      await apiService.post(ENDPOINTS.MEMBERS.CREATE(orgId), {
        personId: me.id,
      });
      queueChanged();
      notify("Request sent. It needs the advisor's and an admin's signature.");
    } catch (e) {
      notify(e.message, "error");
    }
  };
  const remove = async (m) => {
    try {
      await apiService.delete(ENDPOINTS.MEMBERS.DELETE(orgId, m.id));
      notify(`${m.name} is off the roster.`);
      members.reload();
      queueChanged();
    } catch (e) {
      notify(e.message, "error");
    }
  };

  if (members.error) return <ErrorNote error={members.error} what="the members" />;
  const rows = (members.data || []).map((m) => ({
    id: m.id,
    name: (
      <Box>
        <Typography variant="body2" fontWeight={650}>
          {m.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {m.department}
        </Typography>
      </Box>
    ),
    search: `${m.name} ${m.memberId} ${roleLabel(m.role)} ${m.department}`,
    memberId: m.memberId,
    role: (
      <Box
        component="span"
        sx={{
          fontWeight: OFFICERS.includes(m.role) || m.role === "ADVISOR" ? 700 : 400,
        }}
      >
        {roleLabel(m.role)}
        {m.type && m.type !== "FULL" ? `, ${m.type.toLowerCase()}` : ""}
      </Box>
    ),
    joinedAt: m.joinedAt ? m.joinedAt.slice(0, 10) : "–",
    actions:
      (manage || m.email === email) && !(m.role === "ADVISOR" && !admin) ? (
        <Tooltip title={m.email === email ? "Leave the club" : "Remove from the roster"}>
          <IconButton size="small" onClick={() => remove(m)} aria-label={`Remove ${m.name}`}>
            <PersonRemoveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null,
  }));
  const isMember = myRoles.length > 0;

  return (
    <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "14px" }}>
      <DataTable
        searchable
        columns={[
          { header: "Name", accessor: "name" },
          { header: "Number", accessor: "memberId" },
          { header: "Role", accessor: "role" },
          { header: "Joined", accessor: "joinedAt" },
          { header: "", accessor: "actions", align: "right" },
        ]}
        rows={rows}
        toolbar={
          <Box display="flex" gap={1}>
            {!isMember && !admin && org?.isActive && (
              <Button variant="outlined" onClick={join}>
                Ask to join
              </Button>
            )}
            {manage && org?.isActive && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setAdding(true)}
              >
                Add member
              </Button>
            )}
          </Box>
        }
      />
      <AddMember
        open={adding}
        onClose={() => setAdding(false)}
        orgId={orgId}
        onAdded={members.reload}
      />
    </Paper>
  );
}
