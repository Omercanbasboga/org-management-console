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
import { categoryColor } from "../../theme";

export default function CategoryList() {
  const notify = useNotify();
  const [name, setName] = useState("");
  const { data, error, reload } = useLoad(() => apiService.get(ENDPOINTS.CATEGORIES.LIST));
  const run = async (fn, ok) => {
    try {
      await fn();
      notify(ok);
      reload();
    } catch (e) {
      notify(e.message, "error");
    }
  };
  if (error) return <ErrorNote error={error} what="the categories" />;
  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Used to group clubs and colour their badges. Only admins change this list."
      />
      <Paper sx={{ p: 2.5, borderRadius: "14px", maxWidth: 720 }}>
        <DataTable
          toolbar={
            <Box
              component="form"
              display="flex"
              gap={1}
              onSubmit={(e) => {
                e.preventDefault();
                run(() => apiService.post(ENDPOINTS.CATEGORIES.CREATE, { name }), `${name} added.`);
                setName("");
              }}
            >
              <TextField
                size="small"
                label="New category"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button type="submit" variant="contained" disabled={!name.trim()}>
                Add
              </Button>
            </Box>
          }
          columns={[
            { header: "Name", accessor: "name" },
            { header: "", accessor: "actions", align: "right" },
          ]}
          rows={(data || []).map((c) => ({
            id: c.id,
            name: (
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "4px",
                    bgcolor: categoryColor(c.name),
                  }}
                />
                {c.name}
              </Box>
            ),
            actions: (
              <IconButton
                size="small"
                aria-label={`Delete ${c.name}`}
                onClick={() =>
                  run(
                    () => apiService.delete(ENDPOINTS.CATEGORIES.DELETE(c.id)),
                    `${c.name} deleted.`
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
