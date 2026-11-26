import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { apiService, ENDPOINTS } from "../../api/client";
import { useNotify } from "../../components/Notify";

const EMPTY = {
  name: "",
  shortName: "",
  description: "",
  email: "",
  website: "",
  foundingDate: "",
  categoryId: "",
  locationId: "",
};

/** Create (admin) or edit (officers; category and room stay with the admin, the server checks). */
export default function OrganizationDialog({ open, onClose, onSaved, org }) {
  const notify = useNotify();
  const [form, setForm] = useState(EMPTY);
  const [lists, setLists] = useState({ categories: [], locations: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      org
        ? {
            ...EMPTY,
            ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, org[k] ?? ""])),
          }
        : EMPTY
    );
    Promise.all([
      apiService.get(ENDPOINTS.CATEGORIES.LIST),
      apiService.get(ENDPOINTS.LOCATIONS.LIST),
    ])
      .then(([categories, locations]) => setLists({ categories, locations }))
      .catch(() => {});
  }, [open, org]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async () => {
    setSaving(true);
    const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]));
    try {
      if (org) await apiService.put(ENDPOINTS.ORGANIZATIONS.UPDATE(org.id), body);
      else await apiService.post(ENDPOINTS.ORGANIZATIONS.CREATE, body);
      notify(org ? "Saved." : `${form.name} created.`);
      onSaved?.();
      onClose();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{org ? `Edit ${org.name}` : "New club"}</DialogTitle>
      <DialogContent>
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "2fr 1fr" }} gap={2} pt={1}>
          <TextField label="Name" value={form.name} onChange={set("name")} required autoFocus />
          <TextField
            label="Short name"
            value={form.shortName}
            onChange={set("shortName")}
            inputProps={{ maxLength: 32 }}
          />
          <TextField
            label="What the club does"
            value={form.description}
            onChange={set("description")}
            multiline
            minRows={2}
            sx={{ gridColumn: "1 / -1" }}
          />
          <TextField select label="Category" value={form.categoryId} onChange={set("categoryId")}>
            <MenuItem value="">None</MenuItem>
            {lists.categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Founded"
            type="date"
            value={form.foundingDate}
            onChange={set("foundingDate")}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Usual room"
            value={form.locationId}
            onChange={set("locationId")}
            sx={{ gridColumn: "1 / -1" }}
          >
            <MenuItem value="">None</MenuItem>
            {lists.locations.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Email" type="email" value={form.email} onChange={set("email")} />
          <TextField label="Website" value={form.website} onChange={set("website")} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={!form.name.trim() || saving}>
          {org ? "Save" : "Create club"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
