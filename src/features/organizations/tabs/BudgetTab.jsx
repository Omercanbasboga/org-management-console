import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import DataTable from "../../../components/DataTable/DataTable";
import { apiService, ENDPOINTS } from "../../../api/client";

function SummaryCard({ label, value }) {
  return (
    <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
    </Card>
  );
}

export default function BudgetTab({ orgId }) {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.get(ENDPOINTS.FINANCE.SUMMARY(orgId)),
      apiService.get(ENDPOINTS.FINANCE.TRANSACTIONS(orgId)),
    ])
      .then(([s, t]) => {
        setSummary(s);
        setTransactions(t || []);
      })
      .catch((e) => console.error("Failed to load budget", e))
      .finally(() => setLoading(false));
  }, [orgId]);

  const columns = [
    { header: "Date", accessor: "date", width: "20%" },
    { header: "Category", accessor: "category", width: "25%" },
    { header: "Description", accessor: "description", width: "35%" },
    { header: "Amount", accessor: "amount", width: "20%", align: "right" },
  ];

  const rows = transactions.map((t) => ({
    id: t.id,
    date: t.date,
    category: t.category,
    description: t.description,
    amount: t.amount != null ? `${t.amount} ${t.currency || ""}` : "-",
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <SummaryCard label="Balance" value={summary?.balance ?? "-"} />
        </Grid>
        <Grid item xs={4}>
          <SummaryCard label="Income" value={summary?.income ?? "-"} />
        </Grid>
        <Grid item xs={4}>
          <SummaryCard label="Expenses" value={summary?.expenses ?? "-"} />
        </Grid>
      </Grid>
      <DataTable columns={columns} rows={rows} searchable />
    </Box>
  );
}

BudgetTab.propTypes = { orgId: PropTypes.string.isRequired };
