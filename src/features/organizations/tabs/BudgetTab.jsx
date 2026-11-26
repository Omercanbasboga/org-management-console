import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import { apiService, ENDPOINTS } from "../../../api/client";
import useLoad from "../../../hooks/useLoad";
import { useNotify } from "../../../components/Notify";
import DataTable from "../../../components/DataTable";
import ErrorNote from "../../../components/ErrorNote";
import { can } from "../roles";

const money = (n, cur = "TRY") =>
  `${Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;

function Tile({ label, value, tone }) {
  const t = useTheme().tokens;
  return (
    <Paper sx={{ p: 2, borderRadius: "14px" }}>
      <Typography variant="body2" color="text.secondary" fontWeight={650}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "1.6rem",
          fontWeight: 800,
          color: tone ? t[tone] : "text.primary",
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

function Record({ open, onClose, orgId, onSaved, balance }) {
  const notify = useNotify();
  const [form, setForm] = useState({
    type: "EXPENSE",
    amount: "",
    category: "",
    description: "",
    date: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const over = form.type === "EXPENSE" && Number(form.amount) > balance;
  const save = async () => {
    try {
      await apiService.post(ENDPOINTS.FINANCE.TRANSACTIONS(orgId), {
        ...form,
        amount: Number(form.amount),
        date: form.date || null,
      });
      notify(form.type === "INCOME" ? "Income recorded." : "Expense recorded.");
      onSaved();
      onClose();
      setForm({
        type: "EXPENSE",
        amount: "",
        category: "",
        description: "",
        date: "",
      });
    } catch (e) {
      notify(e.message, "error");
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Record a transaction</DialogTitle>
      <DialogContent>
        <Box display="grid" gap={2} pt={1}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={form.type}
            onChange={(_, v) => v && setForm((f) => ({ ...f, type: v }))}
          >
            <ToggleButton value="EXPENSE">Expense</ToggleButton>
            <ToggleButton value="INCOME">Income</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label="Amount (TRY)"
            type="number"
            value={form.amount}
            onChange={set("amount")}
            inputProps={{ min: 0.01, step: 0.01 }}
            error={over}
            helperText={over ? `More than the balance of ${money(balance)}.` : " "}
            autoFocus
          />
          <TextField
            label="What for"
            value={form.description}
            onChange={set("description")}
            required
          />
          <TextField
            label="Category"
            value={form.category}
            onChange={set("category")}
            placeholder="Equipment, Travel..."
          />
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={set("date")}
            InputLabelProps={{ shrink: true }}
            helperText="Leave empty for today."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={!(Number(form.amount) > 0) || !form.description.trim()}
        >
          Record
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function BudgetTab({ orgId, org, myRoles, admin }) {
  const t = useTheme().tokens;
  const [open, setOpen] = useState(false);
  const summary = useLoad(() => apiService.get(ENDPOINTS.FINANCE.SUMMARY(orgId)), [orgId]);
  const ledger = useLoad(() => apiService.get(ENDPOINTS.FINANCE.TRANSACTIONS(orgId)), [orgId]);
  if (summary.error) return <ErrorNote error={summary.error} what="the budget" />;
  const s = summary.data;
  const reload = () => {
    summary.reload();
    ledger.reload();
  };

  return (
    <Box display="grid" gap={2}>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }} gap={2}>
        {s ? (
          <>
            <Tile label="Balance" value={money(s.balance, s.currency)} />
            <Tile label="Income" value={money(s.income, s.currency)} tone="good" />
            <Tile label="Spent" value={money(s.expenses, s.currency)} />
          </>
        ) : (
          [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={88} />)
        )}
      </Box>
      <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "14px" }}>
        <Typography variant="h3" mb={1.5}>
          Ledger
        </Typography>
        {ledger.error ? (
          <Typography variant="body2" color="text.secondary">
            {ledger.error.message} Officers and the advisor see each line.
          </Typography>
        ) : (
          <DataTable
            searchable
            toolbar={
              can.recordMoney(myRoles, admin) &&
              org?.isActive && (
                <Button variant="contained" onClick={() => setOpen(true)}>
                  Record
                </Button>
              )
            }
            columns={[
              { header: "Date", accessor: "date", width: 110 },
              { header: "What for", accessor: "description" },
              { header: "Category", accessor: "category" },
              { header: "Amount", accessor: "amount", align: "right" },
            ]}
            rows={(ledger.data || []).map((x) => ({
              id: x.id,
              date: (
                <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                  {x.date}
                </Box>
              ),
              description: x.description,
              category: x.category,
              search: `${x.description} ${x.category || ""}`,
              amount: (
                <Box
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: x.type === "INCOME" ? t.good : "text.primary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {x.type === "INCOME" ? "+" : "−"}
                  {money(x.amount, x.currency)}
                </Box>
              ),
            }))}
          />
        )}
      </Paper>
      <Record
        open={open}
        onClose={() => setOpen(false)}
        orgId={orgId}
        onSaved={reload}
        balance={s?.balance ?? 0}
      />
    </Box>
  );
}
