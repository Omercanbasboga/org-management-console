import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { apiService, ENDPOINTS } from "../../api/client";
import useLoad from "../../hooks/useLoad";
import { useNotify } from "../../components/Notify";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import ErrorNote from "../../components/ErrorNote";

export default function LocationList() {
  const notify = useNotify();
  const [form, setForm] = useState({ name: "", capacity: "" });
  const { data, error, reload } = useLoad(() => apiService.get(ENDPOINTS.LOCATIONS.LIST));
  const run = async (fn, ok) => {
    try {
      await fn();
      notify(ok);
      reload();
    } catch (e) {
      notify(e.message, "error");
    }
  };
  if (error) return <ErrorNote error={error} what="the rooms" />;
  return (
    <>
      <PageHeader
        title="Rooms"
        subtitle="Where clubs meet. A meeting can't expect more people than its room holds."
      />
      <Paper sx={{ p: 2.5, borderRadius: "14px", maxWidth: 820 }}>
        <DataTable
          toolbar={
            <Box
              component="form"
              display="flex"
              flexWrap="wrap"
              gap={1}
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  () =>
                    apiService.post(ENDPOINTS.LOCATIONS.CREATE, {
                      name: form.name,
                      capacity: form.capacity ? Number(form.capacity) : null,
                    }),
                  `${form.name} added.`
                );
                setForm({ name: "", capacity: "" });
              }}
            >
              <TextField
                size="small"
                label="Room"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <TextField
                size="small"
                label="Seats"
                type="number"
                sx={{ width: 100 }}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
              <Button type="submit" variant="contained" disabled={!form.name.trim()}>
                Add
              </Button>
            </Box>
          }
          columns={[
            { header: "Room", accessor: "name" },
            { header: "Seats", accessor: "capacity", align: "right" },
            { header: "", accessor: "actions", align: "right" },
          ]}
          rows={(data || []).map((l) => ({
            id: l.id,
            name: l.name,
            capacity: l.capacity,
            actions: (
              <IconButton
                size="small"
                aria-label={`Delete ${l.name}`}
                onClick={() =>
                  run(
                    () => apiService.delete(ENDPOINTS.LOCATIONS.DELETE(l.id)),
                    `${l.name} deleted.`
                  )
                }
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            ),
          }))}
        />
      </Paper>
    </>
  );
}
